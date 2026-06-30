"""
models.py  —  Shared Pydantic models for the JusticePal AI service.
Importing from here avoids circular dependencies between main.py and matcher.py.
"""

from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field


class CaseSuggestions(BaseModel):
    """Strict model for LLM-extracted case metadata chips."""

    case_type: Optional[str] = Field(
        None,
        description="Category of the legal case, e.g. 'Labour Dispute', 'Property Fraud'",
    )
    location: Optional[str] = Field(
        None,
        description="City or district mentioned in the text, e.g. 'Colombo', 'Galle'",
    )
    budget: Optional[Literal["Low", "Medium", "High"]] = Field(
        None,
        description="Client's rough budget tier for legal services",
    )
    language: Optional[Literal["English", "Sinhala"]] = Field(
        None,
        description="Language the user wrote in, or explicitly mentioned",
    )


class ExtractCaseDetailsResponse(BaseModel):
    success: bool
    data: CaseSuggestions
