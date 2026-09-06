"""Central AI Orchestrator unifying Intent, Hybrid Retrieval, Gemini LLM, and Evidence Validation."""

import json
import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.schemas import (
    ChatResponse,
    EvidencePackage,
    LLMStructuredAnswer,
    SourceItem,
)
from app.services.intent_service import intent_service
from app.services.llm_service import llm_service
from app.services.response_validator import response_validator
from rag.retrieval.hybrid import BISHybridRetriever

logger = logging.getLogger(__name__)


BIS_SYSTEM_PROMPT = """You are an evidence-grounded AI assistant for Indian Standards (IS), Bureau of Indian Standards (BIS) conformity schemes, Quality Control Orders (QCOs), and testing laboratories.

CRITICAL REGULATORY RULES:
1. Grounding: Answer ONLY using the official BIS evidence supplied below. Do NOT invent facts or use unverified training knowledge.
2. Standard vs Certification: Distinguish between standard applicability and certification. Having an Indian Standard does NOT automatically mean certification is legally mandatory.
3. Mandatory Status: Certification is ONLY mandatory if a specific Gazette Quality Control Order (QCO) is present in the evidence. If no QCO is in evidence, state that mandatory status was not found in retrieved records.
4. Specificity: Preserve exact IS numbers, enforcement dates, and ministry names as supplied.
5. Incomplete Evidence: If the evidence does not contain sufficient details to answer fully, explicitly state what is known and what requires further verification.
6. Sources: Reference the provided official source documents and URLs.
7. Tone: Professional, objective, helpful, and regulatory-grade.
"""


class BISOrchestrator:
    """Coordinates the end-to-end question answering pipeline."""

    def __init__(
        self,
        retriever: Optional[BISHybridRetriever] = None,
    ):
        self.retriever = retriever or BISHybridRetriever()

    def orchestrate(
        self,
        message: str,
        db_session: Optional[Session] = None,
    ) -> ChatResponse:
        """Process user question through full Phase 5 evidence-grounded pipeline.
        
        Args:
            message: Raw user query string.
            db_session: Optional database session.
            
        Returns:
            ChatResponse: Structured response with answer, sources, confidence, and warnings.
        """
        clean_query = message.strip()
        logger.info(f"Orchestrating query: '{clean_query[:75]}'")

        # Step 1: Intent Detection & Entity Extraction
        intent_result = intent_service.detect_intent(clean_query)
        logger.info(f"Detected intent '{intent_result.intent}' (confidence {intent_result.confidence})")

        # Step 2: Check for Underspecified Query Triggering Clarification
        if intent_result.clarification_required:
            return ChatResponse(
                answer=intent_result.clarifying_question or "Please provide additional product details.",
                intent=intent_result.intent,
                confidence=intent_result.confidence,
                confidence_level="MEDIUM",
                needs_clarification=True,
                clarifying_question=intent_result.clarifying_question,
                sources=[],
                evidence_used=[],
                warnings=["Clarification required: query lacked specific product or standard details."],
                entities=intent_result.entities,
            )

        # Step 3: Hybrid Knowledge Retrieval (Semantic Vector + SQLite Relational)
        search_result = self.retriever.search(
            query=clean_query,
            top_k=settings.RETRIEVAL_TOP_K,
            db_session=db_session,
        )

        # Step 4: Build Evidence Package
        evidence_package = EvidencePackage(
            query=clean_query,
            intent=intent_result.intent,
            structured_facts=search_result.structured_entities,
            semantic_evidence=search_result.semantic_chunks,
            sources=search_result.sources,
            retrieval_confidence=search_result.confidence_score,
            entities=intent_result.entities,
        )

        # Step 5: Check for Insufficient Evidence
        has_direct_entity = bool(
            intent_result.entities.get("product_id")
            or intent_result.entities.get("is_number")
            or intent_result.entities.get("certification_scheme")
            or intent_result.intent in ["GENERAL_BIS_QUERY", "CONSUMER_SERVICE_QUERY", "LABORATORY_QUERY"]
        )
        top_semantic_score = search_result.semantic_chunks[0]["score"] if search_result.semantic_chunks else 0.0
        has_strong_semantic = top_semantic_score >= 0.58

        if not has_direct_entity and not has_strong_semantic:
            return ChatResponse(
                answer=(
                    "I could not locate sufficient official BIS evidence regarding your query in the current curated database. "
                    "Please verify your product specifications or search directly on the official BIS portal (https://www.bis.gov.in)."
                ),
                intent=intent_result.intent,
                confidence=0.0,
                confidence_level="INSUFFICIENT_EVIDENCE",
                needs_clarification=False,
                clarifying_question=None,
                sources=[],
                evidence_used=[],
                warnings=["No matching Indian Standards, products, or QCO records found in retrieved knowledge."],
                entities=intent_result.entities,
            )

        # Step 6: Construct LLM Prompt
        user_prompt = self._construct_prompt(evidence_package)

        # Step 7: Call Gemini LLM Service
        raw_llm_output = self._call_llm(user_prompt)

        # Step 8: Validate Response against Evidence
        validated_output, validated_sources, warnings = response_validator.validate(
            llm_output=raw_llm_output,
            evidence=evidence_package,
        )

        # Step 9: Determine Confidence Level
        conf_score = search_result.confidence_score
        if conf_score >= 0.70:
            conf_level = "HIGH"
        elif conf_score >= 0.40:
            conf_level = "MEDIUM"
        else:
            conf_level = "LOW"

        # Step 10: Collect Evidence Summary Points
        evidence_points = []
        for std in search_result.structured_entities.get("standards", []):
            evidence_points.append(f"Standard: {std.get('is_number')} - {std.get('title')}")
        for qco in search_result.structured_entities.get("qcos", []):
            mand = "Mandatory" if qco.get("mandatory") else "Voluntary"
            evidence_points.append(f"QCO: {qco.get('name')} ({mand}, effective {qco.get('enforcement_date')})")
        for prod in search_result.structured_entities.get("products", []):
            evidence_points.append(f"Product: {prod.get('product_name')}")

        return ChatResponse(
            answer=validated_output.answer,
            intent=intent_result.intent,
            confidence=round(conf_score, 2),
            confidence_level=conf_level,
            needs_clarification=False,
            clarifying_question=None,
            sources=validated_sources,
            evidence_used=evidence_points[:5],
            warnings=warnings,
            entities=intent_result.entities,
        )

    def _construct_prompt(self, evidence: EvidencePackage) -> str:
        """Format the complete evidence package and query into an LLM prompt."""
        sections = [
            f"USER QUERY: {evidence.query}",
            f"DETECTED INTENT: {evidence.intent}",
            f"EXTRACTED ENTITIES: {json.dumps(evidence.entities)}",
            "\n--- STRUCTURED OFFICIAL BIS FACTS ---",
            json.dumps(evidence.structured_facts, indent=2, default=str),
            "\n--- SEMANTIC EVIDENCE CHUNKS ---",
        ]

        for idx, chunk in enumerate(evidence.semantic_evidence, start=1):
            sections.append(
                f"[{idx}] Source: {chunk.get('source_title')} ({chunk.get('source_url')})\n"
                f"Content: {chunk.get('text')}\n"
            )

        sections.append(
            "\nINSTRUCTIONS:\n"
            "Synthesize a clear, direct, evidence-grounded answer addressing the user query. "
            "Cite the specific standard numbers and QCO enforcement details if available. "
            "Do not invent any details not present in the text above."
        )

        return "\n".join(sections)

    def _call_llm(self, prompt: str) -> LLMStructuredAnswer:
        """Invoke LLM and parse response into LLMStructuredAnswer."""
        try:
            output_str = llm_service.generate(
                prompt=prompt,
                system_instruction=BIS_SYSTEM_PROMPT,
                response_schema=LLMStructuredAnswer,
            )

            # Try parsing JSON
            try:
                data = json.loads(output_str)
                return LLMStructuredAnswer(**data)
            except Exception:
                # If model returned pure text
                return LLMStructuredAnswer(
                    answer=output_str.strip(),
                    summary=None,
                    applicable_standards=[],
                    mandatory_status=None,
                    qco_details=None,
                    testing_laboratories=[],
                    cited_sources=[],
                    warnings=[],
                )
        except Exception as e:
            logger.warning(f"Error during LLM generation: {e}")
            return LLMStructuredAnswer(
                answer=(
                    "An error occurred while communicating with the AI generation model. "
                    "However, official BIS records were retrieved successfully. "
                    "Please review the verified source citations listed below."
                ),
                summary=None,
                applicable_standards=[],
                mandatory_status=None,
                qco_details=None,
                testing_laboratories=[],
                cited_sources=[],
                warnings=[f"LLM generation warning: {str(e)}"],
            )


orchestrator = BISOrchestrator()
