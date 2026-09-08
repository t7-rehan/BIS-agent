"""Central AI Orchestrator unifying Intent, Hybrid Retrieval, Gemini LLM, and Evidence Validation."""

import json
import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.schemas import (
    ChatResponse,
    ConversationTurn,
    EvidencePackage,
    LLMStructuredAnswer,
    SourceItem,
)
from app.services.intent_service import intent_service
from app.services.llm_service import LLMError, LLMTimeoutError, llm_service
from app.services.response_validator import response_validator
from rag.retrieval.hybrid import BISHybridRetriever

logger = logging.getLogger(__name__)


# ── System prompts ────────────────────────────────────────────────────────────

BIS_SYSTEM_PROMPT = """You are BIS Agent — an evidence-grounded AI assistant for Indian Standards (IS), \
Bureau of Indian Standards (BIS) conformity schemes, Quality Control Orders (QCOs), and testing laboratories.

CRITICAL REGULATORY RULES:
1. Grounding: Answer ONLY using the official BIS evidence supplied below. Do NOT invent facts or use unverified training knowledge.
2. Standard vs Certification: Distinguish between standard applicability and certification. Having an Indian Standard does NOT automatically mean certification is legally mandatory.
3. Mandatory Status: Certification is ONLY mandatory if a specific Gazette Quality Control Order (QCO) is present in the evidence. If no QCO is in evidence, state that mandatory status was not found in retrieved records.
4. Specificity: Preserve exact IS numbers, enforcement dates, and ministry names as supplied.
5. Incomplete Evidence: If the evidence does not contain sufficient details to answer fully, explicitly state what is known and what requires further verification.
6. Sources: Reference the provided official source documents and URLs.
7. Tone: Professional, friendly, helpful, and regulatory-grade. Speak as a knowledgeable assistant, not a database query tool.
"""

CONVERSATIONAL_SYSTEM_PROMPT = """You are BIS Agent — a friendly, knowledgeable AI assistant \
specialising in Indian Standards (BIS/IS), product certification, Quality Control Orders (QCOs), \
testing laboratories, hallmarking, and related regulatory topics in India.

Your personality:
- Warm, concise, and helpful
- You speak naturally like a modern AI assistant
- You always connect answers back to BIS where relevant
- You are honest about what you know vs. what you don't

For general knowledge questions (e.g. "What is ISO?", "What is certification?"):
- Answer clearly and briefly from your knowledge
- Connect to BIS/India context where relevant
- Suggest a follow-up BIS question if natural

For conversational exchanges (greetings, thanks, small talk):
- Respond naturally and briefly
- You are named "BIS Agent"
- Offer to help with BIS topics when appropriate but don't force it

NEVER invent specific IS numbers, QCO details, enforcement dates, or mandatory certification claims.
If a question requires specific BIS data (which standard applies to X, is Y mandatory, where to test Z),
say that you can look that up and ask them to phrase it as a specific BIS query.
"""

# Intents that use the full BIS RAG pipeline
BIS_RAG_INTENTS = {
    "PRODUCT_STANDARD_QUERY",
    "QCO_COMPLIANCE_QUERY",
    "CERTIFICATION_QUERY",
    "LABORATORY_QUERY",
    "HALLMARKING_QUERY",
    "CONSUMER_SERVICE_QUERY",
    "STANDARD_LOOKUP",
    "GENERAL_BIS_QUERY",
}

# Intents that are purely conversational (no retrieval)
CONVERSATIONAL_INTENTS = {"GREETING", "CASUAL_CONVERSATION", "GENERAL_INFORMATION"}


class BISOrchestrator:
    """Coordinates the end-to-end question answering pipeline."""

    def __init__(self, retriever: Optional[BISHybridRetriever] = None):
        self.retriever = retriever or BISHybridRetriever()

    # ── Public entry point ────────────────────────────────────────────────────

    def orchestrate(
        self,
        message: str,
        context: Optional[List[ConversationTurn]] = None,
        db_session: Optional[Session] = None,
    ) -> ChatResponse:
        """Process user message through the appropriate pipeline.

        Routes to:
          - Static response      → GREETING (instant, no LLM)
          - Conversational LLM   → CASUAL_CONVERSATION, GENERAL_INFORMATION
          - Full BIS RAG + LLM   → all domain-specific intents
        """
        clean_query = message.strip()
        logger.info("[Orchestrator] Query: '%s'", clean_query[:80])

        # ── Step 1: Intent + entity detection (with conversation context) ───
        intent_result = intent_service.detect_intent(clean_query, context=context)
        logger.info("[Orchestrator] Intent='%s' confidence=%.2f", intent_result.intent, intent_result.confidence)

        # ── Step 2: Route by intent ───────────────────────────────────────────

        # 2a. Simple greeting — instant static response, no LLM call needed
        if intent_result.intent == "GREETING":
            return self._greeting_response(clean_query)

        # 2b. Casual conversation / capability / general info — conversational LLM
        if intent_result.intent in ("CASUAL_CONVERSATION", "GENERAL_INFORMATION"):
            return self._conversational_response(
                query=clean_query,
                intent=intent_result.intent,
                entities=intent_result.entities,
                context=context,
            )

        # 2c. Clarification required (underspecified BIS query)
        if intent_result.clarification_required:
            return ChatResponse(
                answer=intent_result.clarifying_question or "Could you give me a bit more detail about the product or standard you have in mind?",
                intent=intent_result.intent,
                confidence=intent_result.confidence,
                confidence_level="MEDIUM",
                needs_clarification=True,
                clarifying_question=intent_result.clarifying_question,
                sources=[],
                evidence_used=[],
                warnings=[],
                entities=intent_result.entities,
                generation_mode="static",
            )

        # 2d. Completely unknown query — friendly redirect
        if intent_result.intent == "UNKNOWN_QUERY":
            return self._unknown_response(intent_result.entities)

        # 2e. Full BIS RAG + Gemini pipeline for domain-specific queries
        return self._bis_rag_response(
            query=clean_query,
            intent_result=intent_result,
            context=context,
            db_session=db_session,
        )

    # ── Static response helpers ───────────────────────────────────────────────

    def _greeting_response(self, query: str = "") -> ChatResponse:
        """Return an instant, friendly greeting without calling Gemini or retrieval."""
        ql = query.lower()
        if "morning" in ql:
            answer = "Good morning! I'm BIS Agent. What can I help you with today?"
        elif "afternoon" in ql:
            answer = "Good afternoon! I'm BIS Agent. What can I help you with today?"
        elif "evening" in ql:
            answer = "Good evening! I'm BIS Agent. What can I help you with today?"
        elif "namaste" in ql or "namaskar" in ql:
            answer = "Namaste! I'm BIS Agent, your assistant for Indian Standards and BIS services. How can I help you today?"
        else:
            answer = "Hello! I'm BIS Agent. How can I help you today with Indian Standards or BIS services?"

        return ChatResponse(
            answer=answer,
            intent="GREETING",
            confidence=None,
            confidence_level=None,
            needs_clarification=False,
            clarifying_question=None,
            sources=[],
            evidence_used=[],
            warnings=[],
            entities={},
            generation_mode="static",
        )

    def _unknown_response(self, entities: Dict[str, Any]) -> ChatResponse:
        """Friendly redirect for queries that don't match any known pattern."""
        return ChatResponse(
            answer=(
                "I'm not quite sure what you're looking for — could you tell me a bit more? "
                "I specialise in Indian Standards, BIS certification, Quality Control Orders, "
                "testing laboratories, and hallmarking.\n\n"
                "For example, you can ask:\n"
                "• \"Which Indian Standard applies to pressure cookers?\"\n"
                "• \"Is BIS certification mandatory for LED lamps?\"\n"
                "• \"Which labs can test cement?\"\n\n"
                "For inquiries outside these areas, please verify directly on bis.gov.in."
            ),
            intent="UNKNOWN_QUERY",
            confidence=None,
            confidence_level=None,
            needs_clarification=False,
            clarifying_question=None,
            sources=[],
            evidence_used=[],
            warnings=[],
            entities=entities,
            generation_mode="static",
        )

    # ── Conversational LLM response (no retrieval) ───────────────────────────

    def _conversational_response(
        self,
        query: str,
        intent: str,
        entities: Dict[str, Any],
        context: Optional[List[ConversationTurn]],
    ) -> ChatResponse:
        """Generate a natural conversational reply via Gemini without BIS retrieval."""
        # Build prompt — include conversation history for context-aware follow-ups
        history_block = self._format_context(context)
        capability_hint = entities.get("capability_query", False)

        if capability_hint:
            prompt = (
                f"{history_block}"
                "USER: What can you help me with?\n"
                "Describe your capabilities as BIS Agent concisely and naturally."
            )
        else:
            prompt = (
                f"{history_block}"
                f"USER: {query}\n"
                "Respond naturally and briefly. If relevant, mention that you can help with "
                "Indian Standards, BIS certification, QCOs, testing laboratories, or hallmarking."
            )

        try:
            raw = llm_service.generate(
                prompt=prompt,
                system_instruction=CONVERSATIONAL_SYSTEM_PROMPT,
                response_schema=None,  # plain text for conversational replies
            )
            answer = raw.strip() if raw else self._fallback_conversational(query)
        except (LLMError, LLMTimeoutError, Exception) as exc:
            logger.warning("[Orchestrator] Conversational LLM failed: %s", exc)
            answer = self._fallback_conversational(query)

        return ChatResponse(
            answer=answer,
            intent=intent,
            confidence=None,
            confidence_level=None,
            needs_clarification=False,
            clarifying_question=None,
            sources=[],
            evidence_used=[],
            warnings=[],
            entities=entities,
            generation_mode="conversational",
        )

    def _fallback_conversational(self, query: str) -> str:
        """Deterministic fallback when Gemini is unavailable for a conversational reply."""
        q = query.lower()
        if any(w in q for w in ["thank", "thx", "ty"]):
            return "You're very welcome! Let me know if you need anything else regarding Indian Standards or BIS certification."
        if any(w in q for w in ["great", "awesome", "perfect", "good", "nice", "excellent", "wonderful"]):
            return "Glad I could help! Feel free to ask if you have any questions about standards, testing labs, or compliance."
        if any(w in q for w in ["bye", "goodbye", "see you"]):
            return "Goodbye! Feel free to return anytime you have questions about Indian Standards or BIS services."
        if any(w in q for w in ["how are you", "how're you", "how do you do", "how r u", "how are things"]):
            return "I'm doing well, thank you! I'm ready to help you with Indian Standards, BIS certification, QCO compliance, and testing laboratories. What can I look up for you?"
        if any(w in q for w in ["what can you", "help with", "capability", "purpose", "who are you", "can you help"]):
            return (
                "I'm BIS Agent, an AI-powered assistant for Indian Standards and BIS services. I can help you:\n"
                "• Find applicable Indian Standards (IS) for products\n"
                "• Check mandatory certification and Quality Control Orders (QCOs)\n"
                "• Locate recognized testing laboratories across India\n"
                "• Understand BIS certification schemes (ISI Mark, CRS, FMCS, Hallmarking)\n"
                "• Provide guidance on consumer rights and reporting substandard goods\n\n"
                "How can I help you today?"
            )
        if any(w in q for w in ["what is iso", "about iso", "iso"]):
            return (
                "ISO (International Organization for Standardization) develops international standards globally. "
                "In India, the Bureau of Indian Standards (BIS) is the National Standards Body and represents India at ISO. "
                "Many Indian Standards (IS) are aligned with ISO/IEC standards.\n\n"
                "Is there a specific product or standard you'd like to check?"
            )
        if any(w in q for w in ["what is certification", "about certification", "why certify"]):
            return (
                "Certification is the process where an accredited body verifies that a product conforms to specified quality and safety standards. "
                "BIS operates certification schemes like the ISI Mark (Scheme I) and Compulsory Registration Scheme (CRS) to protect consumers and ensure product reliability in India.\n\n"
                "Would you like to know if certification is mandatory for a specific product?"
            )
        return "I'm here to help with Indian Standards, BIS certification, and compliance in India. What product or standard would you like to know about?"

    # ── Full BIS RAG + Gemini pipeline ────────────────────────────────────────

    def _bis_rag_response(
        self,
        query: str,
        intent_result: Any,
        context: Optional[List[ConversationTurn]],
        db_session: Optional[Session],
    ) -> ChatResponse:
        """Run the full hybrid retrieval → evidence validation → Gemini pipeline."""

        # Step 3: Hybrid Knowledge Retrieval
        search_query = query
        if intent_result.entities.get("inherited_from_context"):
            prod = intent_result.entities.get("product_name") or ""
            is_num = intent_result.entities.get("is_number") or ""
            search_query = f"{prod} {is_num} {query}".strip()
            logger.info("[Orchestrator] Context-augmented retrieval query: '%s'", search_query)

        search_result = self.retriever.search(
            query=search_query,
            top_k=settings.RETRIEVAL_TOP_K,
            db_session=db_session,
        )

        # Step 4: Build Evidence Package
        evidence_package = EvidencePackage(
            query=query,
            intent=intent_result.intent,
            structured_facts=search_result.structured_entities,
            semantic_evidence=search_result.semantic_chunks,
            sources=search_result.sources,
            retrieval_confidence=search_result.confidence_score,
            entities=intent_result.entities,
        )

        # Step 5: Insufficient evidence check
        has_direct_entity = bool(
            intent_result.entities.get("product_id")
            or intent_result.entities.get("is_number")
            or intent_result.entities.get("certification_scheme")
            or intent_result.intent in {"GENERAL_BIS_QUERY", "CONSUMER_SERVICE_QUERY", "LABORATORY_QUERY"}
        )
        top_semantic_score = search_result.semantic_chunks[0]["score"] if search_result.semantic_chunks else 0.0
        has_strong_semantic = top_semantic_score >= 0.58

        if not has_direct_entity and not has_strong_semantic:
            return ChatResponse(
                answer=(
                    "I couldn't find enough official BIS information for that query in the current database. "
                    "You can search directly on the BIS portal at https://www.bis.gov.in, "
                    "or try rephrasing with a specific product name or IS number."
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
                generation_mode="bis_rag",
            )

        # Step 6: Construct LLM prompt (include conversation context for follow-ups)
        user_prompt = self._construct_bis_prompt(evidence_package, context)

        # Step 7: Call Gemini LLM
        raw_llm_output, llm_failed = self._call_llm(user_prompt)

        # Step 8: Validate response against evidence
        validated_output, validated_sources, warnings = response_validator.validate(
            llm_output=raw_llm_output,
            evidence=evidence_package,
        )

        # Step 9: Confidence scoring
        conf_score = search_result.confidence_score
        if llm_failed:
            conf_level = "LOW"
            conf_score = min(conf_score, 0.35)
        elif conf_score >= 0.70:
            conf_level = "HIGH"
        elif conf_score >= 0.40:
            conf_level = "MEDIUM"
        else:
            conf_level = "LOW"

        # Step 10: Evidence summary points
        evidence_points: List[str] = []
        for std in search_result.structured_entities.get("standards", []):
            evidence_points.append(f"Standard: {std.get('is_number')} — {std.get('title')}")
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
            generation_mode="bis_rag",
        )

    # ── Prompt construction ───────────────────────────────────────────────────

    def _format_context(self, context: Optional[List[ConversationTurn]]) -> str:
        """Render conversation history as a readable block for the LLM prompt."""
        if not context:
            return ""
        lines = ["CONVERSATION HISTORY (most recent last):"]
        for turn in context[-6:]:  # cap at 6 turns
            role = turn.role.upper()
            lines.append(f"{role}: {turn.content}")
        lines.append("")
        return "\n".join(lines) + "\n"

    def _construct_bis_prompt(
        self,
        evidence: EvidencePackage,
        context: Optional[List[ConversationTurn]],
    ) -> str:
        """Format the evidence package + optional conversation context into an LLM prompt."""
        sections: List[str] = []

        # Include recent conversation context so follow-up questions resolve correctly
        history_block = self._format_context(context)
        if history_block:
            sections.append(history_block)

        sections += [
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
            "Synthesize a clear, direct, evidence-grounded answer for the user query. "
            "If conversation history is present, use it to understand any follow-up references "
            "(e.g. 'it', 'that product', 'the same standard'). "
            "Cite specific IS numbers and QCO enforcement details where available. "
            "Do not invent any details not present in the evidence above."
        )

        return "\n".join(sections)

    # ── LLM call with error handling ──────────────────────────────────────────

    def _call_llm(self, prompt: str) -> tuple:
        """Invoke Gemini and parse response into LLMStructuredAnswer.

        Returns (LLMStructuredAnswer, llm_failed: bool).
        """
        try:
            output_str = llm_service.generate(
                prompt=prompt,
                system_instruction=BIS_SYSTEM_PROMPT,
                response_schema=LLMStructuredAnswer,
            )
            try:
                data = json.loads(output_str)
                return LLMStructuredAnswer(**data), False
            except Exception:
                return LLMStructuredAnswer(
                    answer=output_str.strip(),
                    summary=None,
                    applicable_standards=[],
                    mandatory_status=None,
                    qco_details=None,
                    testing_laboratories=[],
                    cited_sources=[],
                    warnings=[],
                ), False

        except LLMTimeoutError as exc:
            logger.warning("[Orchestrator] LLM timeout: %s", exc)
            return self._llm_error_answer(f"Request timed out — {exc}"), True

        except LLMError as exc:
            logger.warning("[Orchestrator] LLM error: %s", exc)
            return self._llm_error_answer(str(exc)), True

        except Exception as exc:
            logger.warning("[Orchestrator] Unexpected LLM error: %s", exc)
            return self._llm_error_answer(str(exc)), True

    @staticmethod
    def _llm_error_answer(reason: str) -> LLMStructuredAnswer:
        return LLMStructuredAnswer(
            answer=(
                "I was able to retrieve official BIS records for your query, but ran into a problem "
                "generating the answer right now. Please review the verified source citations below, "
                "or try again in a moment."
            ),
            summary=None,
            applicable_standards=[],
            mandatory_status=None,
            qco_details=None,
            testing_laboratories=[],
            cited_sources=[],
            warnings=[f"LLM generation warning: {reason}"],
        )


orchestrator = BISOrchestrator()
