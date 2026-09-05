"""Pydantic schemas for the BIS Intelligent Assistant Backend."""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class SourceItem(BaseModel):
    """Reference source backing an answer in future RAG phases."""

    title: str = Field(..., description="Title or identifier of the BIS standard or regulatory document")
    url: Optional[str] = Field(None, description="Direct URL to official standard/gazette if available")
    source_type: str = Field(..., description="Classification e.g. Indian Standard, QCO Gazette, Laboratory Spec")
    section: Optional[str] = Field(None, description="Clause or specific section reference")


class ChatRequest(BaseModel):
    """User query request schema."""

    message: str = Field(
        ...,
        description="The user's query or prompt regarding BIS standards or compliance.",
        min_length=1,
        max_length=2000,
    )

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Ensure message is not purely whitespace."""
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be empty or contain only whitespace.")
        return stripped


class ChatResponse(BaseModel):
    """Chat response schema designed for future AI & evidence expansion."""

    answer: str = Field(..., description="Answer text or placeholder response")
    intent: Optional[str] = Field("GENERAL_QUERY", description="Detected user intent classification")
    sources: List[SourceItem] = Field(default_factory=list, description="Validated citations and sources")
    confidence: Optional[float] = Field(None, description="Confidence score from 0.0 to 1.0 if applicable")


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field("ok", description="Liveness status of the backend")
    service: str = Field(..., description="Name of the backend service")
    version: Optional[str] = Field(None, description="Application version")
