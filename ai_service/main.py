from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="JusticePal AI Service")

class QueryRequest(BaseModel):
    query: str

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "JusticePal AI Service is running"}

@app.post("/api/ask")
def ask_question(request: QueryRequest):
    # Placeholder for RAG logic with Gemini and Pinecone
    return {
        "response": f"AI response for: {request.query}",
        "sources": []
    }
