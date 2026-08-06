from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import os
import json
import re
from dotenv import load_dotenv
import asyncpg

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from models import CaseSuggestions, ExtractCaseDetailsResponse
from matcher import find_matching_lawyers

from pathlib import Path

# Load env vars: first from project root .env (has DATABASE_URL),
# then from local ai_service/.env (has GOOGLE_API_KEY).
# override=False means the first loaded value wins, so local takes priority
# if the same key exists in both files.
_root_env = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_root_env)        # root .env  → DATABASE_URL, etc.
load_dotenv(override=True)    # local .env → GOOGLE_API_KEY (overrides root if duplicate)

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="JusticePal AI Service",
    description="AI microservice for case detail extraction and lawyer matching.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # Next.js dev server
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    query: str = Field(..., description="Raw text describing the user's legal situation")


class ManualFilters(BaseModel):
    specialization: Optional[str] = Field(None, description="Filter by lawyer specialization")
    location: Optional[str] = Field(None, description="Filter by lawyer location")
    sort_by: Optional[str] = Field("relevance", description="'relevance' (default) or 'rating'")


class MatchLawyersRequest(BaseModel):
    ai_suggestions: CaseSuggestions = Field(
        ..., description="Extracted case chips from /api/v1/extract-case-details"
    )
    manual_filters: ManualFilters = Field(
        default_factory=ManualFilters,
        description="UI dropdown selections for manual filtering",
    )


class MatchLawyersResponse(BaseModel):
    success: bool
    count: int
    lawyers: list[dict]


# CaseSuggestions and ExtractCaseDetailsResponse are imported from models.py


# ---------------------------------------------------------------------------
# PostgreSQL Database Connection
# ---------------------------------------------------------------------------

async def get_lawyers_from_db() -> list[dict]:
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found, returning empty list.")
        return []
        
    try:
        conn = await asyncpg.connect(db_url)
        
        query = """
        SELECT 
            l.id, 
            u.name, 
            l.specialization, 
            l.location, 
            l.bio, 
            l."hourlyRate", 
            l."profilePicture" as image_url
        FROM "Lawyer" l
        JOIN "User" u ON l."userId" = u.id
        WHERE l."isVerified" = true
        """
        rows = await conn.fetch(query)
        await conn.close()
        
        lawyers = []
        for row in rows:
            lawyer = dict(row)
            
            # Format specialization array into a comma-separated string if it exists
            if isinstance(lawyer.get("specialization"), list):
                lawyer["specialization"] = ", ".join(lawyer["specialization"])
            elif not lawyer.get("specialization"):
                lawyer["specialization"] = "General Practice"
                
            # Default rating to 4.5 for UI consistency
            lawyer["rating"] = 4.5
            
            # Provide fallback image if missing
            if not lawyer.get("image_url"):
                lawyer["image_url"] = f"https://ui-avatars.com/api/?name={lawyer['name'].replace(' ', '+')}&background=random"
                
            lawyers.append(lawyer)
            
        return lawyers
    except Exception as e:
        print(f"Database error: {e}")
        return []


# ---------------------------------------------------------------------------
# LLM initialisation (lazy singleton)
# ---------------------------------------------------------------------------

_llm: Optional[ChatGoogleGenerativeAI] = None


def get_llm() -> ChatGoogleGenerativeAI:
    global _llm
    if _llm is None:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("GOOGLE_API_KEY environment variable is not set.")
        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",   # fast, cost-efficient
            google_api_key=api_key,
            temperature=0,              # deterministic JSON output
            max_tokens=256,             # extraction needs very little output
        )
    return _llm


# ---------------------------------------------------------------------------
# System prompt (optimised for speed + strict JSON)
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are a legal case metadata extractor for a Sri Lankan legal platform.

Your ONLY job is to read the user's text and output a single valid JSON object with exactly these four keys:
  "case_type"  – string | null  (e.g. "Labour Dispute", "Property Fraud", "Divorce", "Criminal Defence")
  "location"   – string | null  (Sri Lankan city/district, e.g. "Colombo", "Galle", "Kandy")
  "budget"     – "Low" | "Medium" | "High" | null
  "language"   – "English" | "Sinhala" | null

Rules:
1. Output ONLY the raw JSON object. No markdown, no code fences, no explanations.
2. If you cannot confidently determine a field, set it to null — do NOT guess or hallucinate.
3. Detect language by what the user wrote in (Sinhala Unicode script → "Sinhala"; Latin script → "English").
   If the user explicitly states a preferred language, use that.
4. Budget heuristics: words like "cheap", "affordable", "low cost" → "Low";
   "moderate", "reasonable" → "Medium"; "best", "top", "premium", "no budget" → "High".
5. Be as fast as possible. Do not add any commentary.

Example output:
{"case_type": "Property Fraud", "location": "Colombo", "budget": "Medium", "language": "English"}"""


# ---------------------------------------------------------------------------
# Helper: parse LLM text → CaseSuggestions
# ---------------------------------------------------------------------------

def _parse_llm_output(raw: str) -> CaseSuggestions:
    """Extract the JSON object from the LLM response and validate it."""
    # Strip any accidental markdown fences
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    # Find the first {...} block
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object found in LLM response: {repr(raw)}")

    parsed = json.loads(match.group())
    return CaseSuggestions(**parsed)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "JusticePal AI Service is running"}


@app.post("/api/v1/extract-case-details", response_model=ExtractCaseDetailsResponse)
async def extract_case_details(request: QueryRequest):
    """
    Accepts raw user-typed text and uses Google Gemini (via LangChain) to
    extract structured case metadata: case_type, location, budget, language.
    Returns null for any field that cannot be confidently determined.
    """
    if not request.query.strip():
        raise HTTPException(status_code=422, detail="query must not be empty.")

    try:
        llm = get_llm()

        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=request.query.strip()),
        ]

        response = await llm.ainvoke(messages)
        raw_text: str = response.content

        suggestions = _parse_llm_output(raw_text)
        return ExtractCaseDetailsResponse(success=True, data=suggestions)

    except RuntimeError as e:
        # Missing API key — config error
        raise HTTPException(status_code=500, detail=str(e))
    except (json.JSONDecodeError, ValueError) as e:
        # LLM returned malformed JSON
        raise HTTPException(
            status_code=502,
            detail=f"Failed to parse LLM response: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.post("/api/v1/match-lawyers", response_model=MatchLawyersResponse)
async def match_lawyers(request: MatchLawyersRequest):
    """
    Accepts AI-extracted case suggestions and optional manual filters,
    then returns a ranked list of matching lawyers from the database.

    - If manual_filters has values → strict filter mode.
    - If manual_filters is empty  → AI semantic search via FAISS.
    """
    try:
        # Convert ManualFilters model to a plain dict for matcher.py
        filters = {
            k: v
            for k, v in request.manual_filters.model_dump().items()
            if v is not None
        }

        # Fetch real lawyers from Postgres
        real_lawyers = await get_lawyers_from_db()

        results = find_matching_lawyers(
            ai_suggestions=request.ai_suggestions,
            manual_filters=filters,
            lawyer_database=real_lawyers,
        )

        return MatchLawyersResponse(
            success=True,
            count=len(results),
            lawyers=results,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching error: {str(e)}")


# Legacy placeholder kept for backward-compat
class LegacyQueryRequest(BaseModel):
    query: str


@app.post("/api/ask")
def ask_question(request: LegacyQueryRequest):
    return {
        "response": f"AI response for: {request.query}",
        "sources": [],
    }
