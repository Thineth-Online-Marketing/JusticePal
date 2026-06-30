from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import os
import json
import re
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from models import CaseSuggestions, ExtractCaseDetailsResponse
from matcher import find_matching_lawyers

load_dotenv(override=True)

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
# Mock Lawyer Database (10 Sri Lankan lawyers)
# ---------------------------------------------------------------------------

MOCK_LAWYERS: list[dict] = [
    {
        "id": "L001",
        "name": "Priya Navaratnam",
        "specialization": "Labour Law",
        "location": "Colombo",
        "rating": 4.8,
        "bio": "Expert in wrongful dismissal, employment contracts, and workers' rights with 15 years of experience in the Colombo Labour Tribunal.",
        "image_url": "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        "id": "L002",
        "name": "Rohan De Silva",
        "specialization": "Property Law",
        "location": "Galle",
        "rating": 4.5,
        "bio": "Specialises in land disputes, title deeds, and property fraud cases across the Southern Province.",
        "image_url": "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        "id": "L003",
        "name": "Anita Perera",
        "specialization": "Corporate Law",
        "location": "Colombo",
        "rating": 4.9,
        "bio": "Corporate governance, mergers, acquisitions, and commercial contracts for Fortune 500 clients operating in Sri Lanka.",
        "image_url": "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
        "id": "L004",
        "name": "Kemal Jayawardena",
        "specialization": "Labour Law",
        "location": "Kandy",
        "rating": 4.2,
        "bio": "Trade union representation, workplace harassment, and termination dispute specialist in the Central Province.",
        "image_url": "https://randomuser.me/api/portraits/men/75.jpg",
    },
    {
        "id": "L005",
        "name": "Samanthi Fernando",
        "specialization": "Family Law",
        "location": "Colombo",
        "rating": 4.6,
        "bio": "Divorce, custody disputes, maintenance claims, and domestic violence cases. Fluent in Sinhala and English.",
        "image_url": "https://randomuser.me/api/portraits/women/12.jpg",
    },
    {
        "id": "L006",
        "name": "Nuwan Bandara",
        "specialization": "Criminal Law",
        "location": "Matara",
        "rating": 4.7,
        "bio": "Criminal defence attorney handling murder, assault, and drug-related cases in Southern Sri Lanka.",
        "image_url": "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
        "id": "L007",
        "name": "Dilini Ratnayake",
        "specialization": "Property Law",
        "location": "Colombo",
        "rating": 4.4,
        "bio": "Real estate transactions, land registration disputes, and boundary demarcation issues in the Western Province.",
        "image_url": "https://randomuser.me/api/portraits/women/22.jpg",
    },
    {
        "id": "L008",
        "name": "Tharindu Wickramasinghe",
        "specialization": "Family Law",
        "location": "Kandy",
        "rating": 4.3,
        "bio": "Adoption proceedings, matrimonial disputes, and child custody representation with a compassionate approach.",
        "image_url": "https://randomuser.me/api/portraits/men/58.jpg",
    },
    {
        "id": "L009",
        "name": "Ishara Gunawardena",
        "specialization": "Corporate Law",
        "location": "Galle",
        "rating": 4.1,
        "bio": "Company incorporation, intellectual property, and contract disputes for SMEs in the Southern coastal region.",
        "image_url": "https://randomuser.me/api/portraits/women/35.jpg",
    },
    {
        "id": "L010",
        "name": "Chaminda Rajapaksha",
        "specialization": "Criminal Law",
        "location": "Colombo",
        "rating": 4.8,
        "bio": "High-profile criminal defence, financial fraud, and white-collar crime specialist with Supreme Court practice.",
        "image_url": "https://randomuser.me/api/portraits/men/10.jpg",
    },
]


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
def match_lawyers(request: MatchLawyersRequest):
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

        results = find_matching_lawyers(
            ai_suggestions=request.ai_suggestions,
            manual_filters=filters,
            lawyer_database=MOCK_LAWYERS,
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
