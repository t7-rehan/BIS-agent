"""Pydantic schemas for the BIS Intelligent Assistant Backend."""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator


class SourceItem(BaseModel):
    """Reference source backing an answer grounded in official evidence."""

    title: str = Field(..., description="Title or identifier of the BIS standard or regulatory document")
    url: Optional[str] = Field(None, description="Direct URL to official standard/gazette if available")
    source_type: str = Field("GENERAL", description="Classification e.g. BIS_STANDARD, BIS_QCO, BIS_LABORATORY")
    section: Optional[str] = Field(None, description="Clause or specific section reference")
    is_number: Optional[str] = Field(None, description="Applicable Indian Standard number if known")


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


class IntentResult(BaseModel):
    """Deterministic intent detection and entity extraction output."""

    intent: str = Field(..., description="Classification category (e.g. PRODUCT_STANDARD_QUERY)")
    confidence: float = Field(..., description="Confidence score for the detected intent (0.0 to 1.0)")
    entities: Dict[str, Any] = Field(default_factory=dict, description="Extracted domain entities")
    clarification_required: bool = Field(False, description="True if query is underspecified")
    clarifying_question: Optional[str] = Field(None, description="Question prompting user for required details")


class EvidencePackage(BaseModel):
    """Unified evidence package assembled for LLM generation."""

    query: str
    intent: str
    structured_facts: Dict[str, Any] = Field(default_factory=dict)
    semantic_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    sources: List[Dict[str, str]] = Field(default_factory=list)
    retrieval_confidence: float = 0.0
    entities: Dict[str, Any] = Field(default_factory=dict)


class LLMStructuredAnswer(BaseModel):
    """Raw structured output schema from Gemini model."""

    answer: str = Field(..., description="Direct, clear, evidence-grounded answer for the user")
    summary: Optional[str] = Field(None, description="One-sentence high-level takeaway")
    applicable_standards: List[str] = Field(default_factory=list, description="Explicit IS numbers mentioned")
    mandatory_status: Optional[str] = Field(None, description="Mandatory, Voluntary, or Insufficient Evidence")
    qco_details: Optional[str] = Field(None, description="Governing QCO name, date, and ministry")
    testing_laboratories: List[str] = Field(default_factory=list, description="Recognized testing facilities")
    cited_sources: List[str] = Field(default_factory=list, description="Official URLs cited in the response")
    warnings: List[str] = Field(default_factory=list, description="Disclaimers or limitations noted")


class ChatResponse(BaseModel):
    """Comprehensive chat response schema combining synthesized answer with evidence."""

    answer: str = Field(..., description="Evidence-grounded answer text")
    intent: Optional[str] = Field("GENERAL_QUERY", description="Detected user intent classification")
    confidence: Optional[Union[float, str]] = Field(None, description="Confidence score or qualitative level (HIGH/MEDIUM/LOW)")
    confidence_level: Optional[str] = Field(None, description="Qualitative confidence rating")
    needs_clarification: bool = Field(False, description="Whether the assistant requires more user details")
    clarifying_question: Optional[str] = Field(None, description="Prompt asking user for specific details")
    sources: List[SourceItem] = Field(default_factory=list, description="Validated citations and sources")
    evidence_used: List[str] = Field(default_factory=list, description="Key evidence points utilized")
    warnings: List[str] = Field(default_factory=list, description="Validation warnings or disclaimers")
    entities: Dict[str, Any] = Field(default_factory=dict, description="Extracted domain entities")


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field("ok", description="Liveness status of the backend")
    service: str = Field(..., description="Name of the backend service")
    version: Optional[str] = Field(None, description="Application version")
