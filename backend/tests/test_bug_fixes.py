"""Regression tests for the three critical bug fixes:

1. LLM generation failure → graceful fallback + LOW confidence (not HIGH)
2. Confidence display → downgraded to LOW when LLM fails
3. Retrieval precision → pressure cooker query must not surface IS 14625 or IS 302

Run with: pytest tests/test_bug_fixes.py -v
"""

import json
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.schemas import ChatResponse, EvidencePackage, LLMStructuredAnswer
from app.services.llm_service import GeminiLLMService, LLMError, LLMTimeoutError
from app.services.orchestrator import BISOrchestrator

client = TestClient(app)


# ====================================================================
# Bug Fix 1 & 2: LLM failure → graceful fallback + LOW confidence
# ====================================================================

class TestLLMFailureHandling:
    """Verify that LLM generation failures degrade gracefully with correct confidence."""

    @patch("app.services.orchestrator.llm_service.generate")
    def test_llm_api_error_returns_low_confidence(self, mock_generate):
        """BUG FIX: LLM API error must produce LOW confidence_level, not HIGH."""
        mock_generate.side_effect = LLMError("Gemini API failure: Connection refused")

        orchestrator = BISOrchestrator()
        response = orchestrator.orchestrate("What is the Indian Standard for pressure cookers?")

        assert isinstance(response, ChatResponse)
        # Confidence MUST be LOW, not HIGH or MEDIUM, when LLM fails
        assert response.confidence_level == "LOW", (
            f"Expected LOW confidence on LLM failure, got '{response.confidence_level}'"
        )
        assert response.confidence <= 0.35, (
            f"Expected confidence score ≤ 0.35 on LLM failure, got {response.confidence}"
        )

    @patch("app.services.orchestrator.llm_service.generate")
    def test_llm_timeout_returns_low_confidence(self, mock_generate):
        """BUG FIX: LLM timeout must produce LOW confidence_level, not HIGH."""
        mock_generate.side_effect = LLMTimeoutError("Gemini API call timed out after 30 seconds.")

        orchestrator = BISOrchestrator()
        response = orchestrator.orchestrate("What standard applies to electric food mixers?")

        assert isinstance(response, ChatResponse)
        assert response.confidence_level == "LOW", (
            f"Expected LOW confidence on timeout, got '{response.confidence_level}'"
        )
        assert response.confidence <= 0.35

    @patch("app.services.orchestrator.llm_service.generate")
    def test_llm_failure_preserves_retrieved_sources(self, mock_generate):
        """BUG FIX: Even when LLM fails, officially retrieved sources must be preserved."""
        mock_generate.side_effect = LLMError("API key invalid")

        orchestrator = BISOrchestrator()
        response = orchestrator.orchestrate("What Indian Standard applies to electric food mixers?")

        assert isinstance(response, ChatResponse)
        # Retrieved sources from DB/vector store should still be present
        assert len(response.sources) > 0, "Sources must be preserved even when LLM fails"

    @patch("app.services.orchestrator.llm_service.generate")
    def test_llm_failure_answer_contains_expected_message(self, mock_generate):
        """BUG FIX: LLM failure answer must communicate that generation failed gracefully."""
        mock_generate.side_effect = Exception("Unexpected upstream error")

        orchestrator = BISOrchestrator()
        response = orchestrator.orchestrate("What is the standard for pressure cookers?")

        # Accept both the old and new graceful failure messages
        answer_lower = response.answer.lower()
        assert (
            "error occurred while communicating with the ai generation model" in answer_lower
            or "ran into a problem" in answer_lower
            or "official bis records" in answer_lower
        ), f"Expected a graceful LLM failure message, got: {response.answer}"

    @patch("app.services.orchestrator.llm_service.generate")
    def test_llm_failure_warning_present(self, mock_generate):
        """BUG FIX: LLM failure must add a warning to the response."""
        mock_generate.side_effect = LLMError("Quota exceeded")

        orchestrator = BISOrchestrator()
        response = orchestrator.orchestrate("What standard applies to electric food mixers?")

        assert any("LLM generation warning" in w for w in response.warnings), (
            "Expected LLM generation warning in response.warnings"
        )

    @patch("app.services.orchestrator.llm_service.generate")
    def test_successful_llm_not_downgraded(self, mock_generate):
        """Sanity check: successful LLM call must NOT be downgraded to LOW."""
        mock_generate.return_value = json.dumps({
            "answer": "Pressure cookers are governed by IS 2347 : 2017.",
            "summary": "Governed by IS 2347.",
            "applicable_standards": ["IS 2347 : 2017"],
            "mandatory_status": "Mandatory",
            "qco_details": "Domestic Pressure Cooker QCO",
            "testing_laboratories": [],
            "cited_sources": [],
            "warnings": [],
        })

        orchestrator = BISOrchestrator()
        response = orchestrator.orchestrate("What is the standard for pressure cookers?")

        assert isinstance(response, ChatResponse)
        assert response.confidence_level in ("HIGH", "MEDIUM"), (
            f"Successful LLM call should not return LOW confidence, got '{response.confidence_level}'"
        )


# ====================================================================
# Bug Fix 1: LLM service timeout implementation
# ====================================================================

class TestLLMServiceTimeout:
    """Verify that LLMTimeoutError is raised when the API call exceeds the configured timeout."""

    def test_timeout_raises_llm_timeout_error(self):
        """BUG FIX: Gemini API calls that hang must raise LLMTimeoutError, not block forever."""
        import time

        # Create a service instance and override the timeout via settings patch
        with patch("app.services.llm_service.settings") as mock_settings:
            mock_settings.LLM_TIMEOUT_SECONDS = 1
            mock_settings.LLM_MAX_OUTPUT_TOKENS = 1024

            service = GeminiLLMService(api_key="test_key", mock_mode=False)
            mock_client = MagicMock()

            def slow_generate(*args, **kwargs):
                time.sleep(5)  # Simulates a hanging API call
                return MagicMock(text="response")

            mock_client.models.generate_content.side_effect = slow_generate
            service._client = mock_client

            with pytest.raises(LLMTimeoutError) as exc_info:
                service.generate(
                    prompt="test prompt",
                    system_instruction="system",
                )

        assert "timed out" in str(exc_info.value).lower()

    def test_fast_call_does_not_timeout(self):
        """Sanity check: a fast API call should complete normally without timeout."""
        service = GeminiLLMService(api_key="test_key", mock_mode=False)
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "answer": "IS 2347 governs pressure cookers.",
            "summary": "Governed by IS 2347.",
            "applicable_standards": ["IS 2347"],
            "mandatory_status": "Mandatory",
            "qco_details": None,
            "testing_laboratories": [],
            "cited_sources": [],
            "warnings": [],
        })
        mock_client.models.generate_content.return_value = mock_response
        service._client = mock_client

        result = service.generate(
            prompt="test prompt",
            system_instruction="system",
        )
        assert "IS 2347" in result


# ====================================================================
# Bug Fix 3: Retrieval precision — pressure cooker query
# ====================================================================

class TestRetrievalPrecision:
    """Verify that the pressure cooker query does not pull in unrelated standards."""

    @patch("app.services.orchestrator.llm_service.generate")
    def test_pressure_cooker_does_not_return_stainless_sink_standard(self, mock_generate):
        """BUG FIX: IS 14625 (Stainless Steel Sinks) must not appear for pressure cooker queries."""
        mock_generate.return_value = json.dumps({
            "answer": "Pressure cookers are governed by IS 2347.",
            "summary": "Governed by IS 2347.",
            "applicable_standards": ["IS 2347"],
            "mandatory_status": "Mandatory",
            "qco_details": None,
            "testing_laboratories": [],
            "cited_sources": [],
            "warnings": [],
        })

        orchestrator = BISOrchestrator()
        response = orchestrator.orchestrate("What is the BIS standard for domestic pressure cookers?")

        source_titles = [s.title for s in response.sources]
        combined = " ".join(source_titles).lower()
        assert "14625" not in combined, (
            f"IS 14625 (Stainless Steel Sinks) must not appear in pressure cooker results. "
            f"Got sources: {source_titles}"
        )

    @patch("app.services.orchestrator.llm_service.generate")
    def test_pressure_cooker_does_not_return_electrical_appliance_standard(self, mock_generate):
        """BUG FIX: IS 302 (Electrical Appliances) must not appear for pressure cooker queries."""
        mock_generate.return_value = json.dumps({
            "answer": "Pressure cookers are governed by IS 2347.",
            "summary": "Governed by IS 2347.",
            "applicable_standards": ["IS 2347"],
            "mandatory_status": "Mandatory",
            "qco_details": None,
            "testing_laboratories": [],
            "cited_sources": [],
            "warnings": [],
        })

        orchestrator = BISOrchestrator()
        response = orchestrator.orchestrate("What is the BIS standard for domestic pressure cookers?")

        # IS 302 is for electrical appliances — must not contaminate pressure cooker results
        all_evidence = " ".join(response.evidence_used).lower()
        source_is_numbers = " ".join(
            s.is_number or "" for s in response.sources
        ).lower()
        # IS 302 should not appear as a source for pressure cookers
        assert "is-302" not in source_is_numbers and "302-2-14" not in source_is_numbers, (
            f"IS 302 (Electrical Appliances) must not appear in pressure cooker results. "
            f"Got sources IS numbers: {source_is_numbers}"
        )

    @patch("app.services.orchestrator.llm_service.generate")
    def test_pressure_cooker_returns_is_2347(self, mock_generate):
        """BUG FIX: Pressure cooker query must return IS 2347 in evidence."""
        mock_generate.return_value = json.dumps({
            "answer": "Pressure cookers are governed by IS 2347.",
            "summary": "Governed by IS 2347.",
            "applicable_standards": ["IS 2347 : 2017"],
            "mandatory_status": "Mandatory",
            "qco_details": None,
            "testing_laboratories": [],
            "cited_sources": [],
            "warnings": [],
        })

        orchestrator = BISOrchestrator()
        response = orchestrator.orchestrate("What standard applies to domestic pressure cookers?")

        # At least IS 2347 should be present in evidence or sources
        evidence_text = " ".join(response.evidence_used).lower()
        source_titles = " ".join(s.title for s in response.sources).lower()
        combined = evidence_text + " " + source_titles

        assert "2347" in combined, (
            f"IS 2347 must appear in evidence for pressure cooker query. "
            f"Got evidence: {response.evidence_used}, sources: {[s.title for s in response.sources]}"
        )


# ====================================================================
# Bug Fix: API-level confidence regression via /api/chat endpoint
# ====================================================================

class TestAPIConfidenceOnFailure:
    """Verify the API endpoint returns correct confidence level on LLM failure."""

    @patch("app.services.orchestrator.llm_service.generate")
    def test_api_confidence_low_on_llm_error(self, mock_generate):
        """BUG FIX: /api/chat must return confidence_level=LOW when LLM fails, not HIGH."""
        mock_generate.side_effect = LLMError("API failure")

        response = client.post("/api/chat", json={"message": "What standard applies to pressure cookers?"})
        assert response.status_code == 200
        data = response.json()

        assert data["confidence_level"] == "LOW", (
            f"Expected LOW confidence from API on LLM failure, got '{data['confidence_level']}'"
        )
        assert data["confidence"] <= 0.35, (
            f"Expected confidence score ≤ 0.35, got {data['confidence']}"
        )

    @patch("app.services.orchestrator.llm_service.generate")
    def test_api_answer_contains_error_message_on_llm_failure(self, mock_generate):
        """BUG FIX: /api/chat answer must contain error message when LLM fails."""
        mock_generate.side_effect = LLMError("quota exceeded")

        response = client.post("/api/chat", json={"message": "Standard for electric food mixers?"})
        assert response.status_code == 200
        data = response.json()

        assert (
            "error occurred" in data["answer"].lower()
            or "ran into a problem" in data["answer"].lower()
            or "official bis records" in data["answer"].lower()
        )

    @patch("app.services.orchestrator.llm_service.generate")
    def test_api_sources_present_on_llm_failure(self, mock_generate):
        """BUG FIX: /api/chat must still return retrieved sources when LLM fails."""
        mock_generate.side_effect = LLMError("Network error")

        response = client.post("/api/chat", json={"message": "Standard for electric food mixers?"})
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data["sources"], list)
        assert len(data["sources"]) > 0, "Verified sources must be returned even on LLM failure"


# ====================================================================
# Conversational AI upgrade tests
# ====================================================================

from app.services.intent_service import BISIntentService
from app.models.schemas import ConversationTurn

intent_svc = BISIntentService()


class TestGreetingIntent:
    """Greetings must route to GREETING intent and return a static welcome response."""

    @pytest.mark.parametrize("greeting", [
        "Hi", "Hello", "Hey", "Good morning", "Good afternoon", "Good evening",
        "hi!", "hello there", "Namaste", "Hola", "Howdy",
    ])
    def test_greeting_detected(self, greeting):
        result = intent_svc.detect_intent(greeting)
        assert result.intent == "GREETING", (
            f"Expected GREETING for '{greeting}', got '{result.intent}'"
        )
        assert not result.clarification_required

    def test_greeting_orchestrator_returns_static_response(self):
        orch = BISOrchestrator()
        resp = orch.orchestrate("Hi")
        assert resp.intent == "GREETING"
        assert resp.generation_mode == "static"
        assert resp.confidence is None, "Greeting must not carry a confidence score"
        assert resp.confidence_level is None, "Greeting must not carry a confidence level"
        assert len(resp.sources) == 0
        assert len(resp.evidence_used) == 0
        assert "BIS Agent" in resp.answer or "BIS" in resp.answer

    def test_greeting_no_retrieval_triggered(self):
        """Greeting must short-circuit before touching the retriever."""
        orch = BISOrchestrator()
        with patch.object(orch.retriever, "search") as mock_search:
            orch.orchestrate("Hello")
            mock_search.assert_not_called()

    def test_api_greeting_returns_no_confidence(self):
        resp = client.post("/api/chat", json={"message": "Hi"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["intent"] == "GREETING"
        assert data["confidence"] is None
        assert data["confidence_level"] is None
        assert data["generation_mode"] == "static"
        assert len(data["sources"]) == 0


class TestCasualConversationIntent:
    """Casual exchanges must be handled as CASUAL_CONVERSATION without BIS retrieval."""

    @pytest.mark.parametrize("phrase", [
        "Thank you", "Thanks", "Thanks a lot", "Thanks so much",
        "How are you?", "How are you", "How're you",
        "Great!", "Awesome!", "Perfect", "Nice",
        "Bye", "Goodbye", "See you",
        "That's helpful", "That is great",
    ])
    def test_casual_detected(self, phrase):
        result = intent_svc.detect_intent(phrase)
        assert result.intent == "CASUAL_CONVERSATION", (
            f"Expected CASUAL_CONVERSATION for '{phrase}', got '{result.intent}'"
        )

    @pytest.mark.parametrize("phrase", [
        "What can you do?", "What can you help with?",
        "How can you help me?", "Tell me about yourself",
    ])
    def test_capability_query_is_casual(self, phrase):
        result = intent_svc.detect_intent(phrase)
        assert result.intent == "CASUAL_CONVERSATION", (
            f"Expected CASUAL_CONVERSATION for capability query '{phrase}', got '{result.intent}'"
        )

    @patch("app.services.orchestrator.llm_service.generate")
    def test_casual_response_has_no_bis_metadata(self, mock_generate):
        mock_generate.return_value = "You're welcome! Let me know if I can help."
        orch = BISOrchestrator()
        resp = orch.orchestrate("Thanks")
        assert resp.intent == "CASUAL_CONVERSATION"
        assert resp.generation_mode == "conversational"
        assert resp.confidence is None
        assert resp.confidence_level is None
        assert len(resp.sources) == 0
        assert len(resp.evidence_used) == 0

    @patch("app.services.orchestrator.llm_service.generate")
    def test_casual_no_retrieval(self, mock_generate):
        mock_generate.return_value = "I'm doing well, thank you!"
        orch = BISOrchestrator()
        with patch.object(orch.retriever, "search") as mock_search:
            orch.orchestrate("How are you?")
            mock_search.assert_not_called()

    @patch("app.services.orchestrator.llm_service.generate")
    def test_casual_llm_failure_uses_fallback(self, mock_generate):
        """Conversational LLM failure must not crash — returns deterministic fallback."""
        mock_generate.side_effect = LLMError("quota exceeded")
        orch = BISOrchestrator()
        resp = orch.orchestrate("Thanks")
        assert resp.generation_mode == "conversational"
        assert resp.answer  # must not be empty
        assert "welcome" in resp.answer.lower() or "help" in resp.answer.lower()


class TestGeneralInformationIntent:
    """General knowledge questions (ISO, certification concept, etc.) must use conversational path."""

    @pytest.mark.parametrize("query", [
        "What is ISO?",
        "What is certification?",          # generic concept — not BIS-specific
        "What is the capital of France?",
    ])
    def test_general_info_not_bis_rag(self, query):
        result = intent_svc.detect_intent(query)
        # Must NOT be a BIS-specific intent
        bis_intents = {
            "PRODUCT_STANDARD_QUERY", "QCO_COMPLIANCE_QUERY", "CERTIFICATION_QUERY",
            "LABORATORY_QUERY", "HALLMARKING_QUERY", "CONSUMER_SERVICE_QUERY",
            "STANDARD_LOOKUP", "GENERAL_BIS_QUERY",
        }
        assert result.intent not in bis_intents, (
            f"'{query}' should not be a BIS RAG intent, got '{result.intent}'"
        )

    @patch("app.services.orchestrator.llm_service.generate")
    def test_general_info_uses_conversational_path(self, mock_generate):
        mock_generate.return_value = "ISO is the International Organization for Standardization."
        orch = BISOrchestrator()
        resp = orch.orchestrate("What is ISO?")
        assert resp.generation_mode == "conversational"
        assert resp.confidence is None
        assert resp.confidence_level is None
        assert len(resp.sources) == 0

    @patch("app.services.orchestrator.llm_service.generate")
    def test_general_info_no_retrieval(self, mock_generate):
        mock_generate.return_value = "ISO is the International Organization for Standardization."
        orch = BISOrchestrator()
        with patch.object(orch.retriever, "search") as mock_search:
            orch.orchestrate("What is ISO?")
            mock_search.assert_not_called()


class TestBISQueriesStillUseRAG:
    """All BIS domain queries must still go through the full retrieval + LLM pipeline."""

    @pytest.mark.parametrize("query", [
        "Which Indian Standard applies to pressure cookers?",
        "Is BIS certification mandatory for pressure cookers?",
        "Tell me about IS 2347",
        "Where can I get a pressure cooker tested?",
        "What is BIS?",
    ])
    @patch("app.services.orchestrator.llm_service.generate")
    def test_bis_query_uses_rag_pipeline(self, mock_generate, query):
        mock_generate.return_value = json.dumps({
            "answer": "Test answer grounded in evidence.",
            "summary": None,
            "applicable_standards": [],
            "mandatory_status": None,
            "qco_details": None,
            "testing_laboratories": [],
            "cited_sources": [],
            "warnings": [],
        })
        orch = BISOrchestrator()
        with patch.object(orch.retriever, "search", wraps=orch.retriever.search) as mock_search:
            resp = orch.orchestrate(query)
            # Retriever must have been called for BIS queries
            mock_search.assert_called_once()
        assert resp.generation_mode == "bis_rag", (
            f"Expected bis_rag for '{query}', got '{resp.generation_mode}'"
        )

    @patch("app.services.orchestrator.llm_service.generate")
    def test_bis_query_retains_confidence(self, mock_generate):
        """A successful BIS RAG response must carry a numeric confidence score."""
        mock_generate.return_value = json.dumps({
            "answer": "IS 2347 applies.",
            "summary": None, "applicable_standards": ["IS 2347"],
            "mandatory_status": "Mandatory", "qco_details": None,
            "testing_laboratories": [], "cited_sources": [], "warnings": [],
        })
        orch = BISOrchestrator()
        resp = orch.orchestrate("Which standard applies to pressure cookers?")
        assert resp.generation_mode == "bis_rag"
        assert resp.confidence is not None
        assert resp.confidence_level in ("HIGH", "MEDIUM", "LOW")


class TestNaturalClarification:
    """Clarification messages must be natural, not robotic."""

    def test_cooker_clarification_is_natural(self):
        result = intent_svc.detect_intent("cooker")
        assert result.clarification_required
        # Must not contain robotic phrases
        q = result.clarifying_question or ""
        assert "UNKNOWN" not in q
        assert "INSUFFICIENT" not in q
        assert "provide a valid" not in q.lower()
        # Must sound natural
        assert any(w in q.lower() for w in ["sure", "can help", "looking for", "mean"]), (
            f"Clarification question doesn't sound natural: '{q}'"
        )

    @pytest.mark.parametrize("query", [
        "which standard applies to my product?",
        "is certification mandatory?",
        "which standard do I need?",
    ])
    def test_underspecified_clarification_is_natural(self, query):
        result = intent_svc.detect_intent(query)
        assert result.clarification_required
        q = result.clarifying_question or ""
        assert q, "Clarifying question must not be empty"
        assert "UNKNOWN" not in q
        assert "ERROR" not in q


class TestUnknownQueryResponse:
    """Unknown queries must get a helpful redirect, not an internal state label."""

    def test_unknown_query_response_is_natural(self):
        orch = BISOrchestrator()
        resp = orch.orchestrate("asdfghjklqwerty")
        assert resp.generation_mode == "static"
        assert resp.confidence is None
        assert resp.confidence_level is None
        # Must not expose internal state names
        assert "UNKNOWN_QUERY" not in resp.answer
        assert "INSUFFICIENT_EVIDENCE" not in resp.answer
        # Must contain a helpful redirect
        assert any(w in resp.answer.lower() for w in ["help", "bis", "standard", "ask"])


class TestConversationContext:
    """Conversation context is forwarded correctly for follow-up resolution."""

    @patch("app.services.orchestrator.llm_service.generate")
    def test_context_included_in_bis_prompt(self, mock_generate):
        """When context is provided, the BIS prompt must include conversation history."""
        mock_generate.return_value = json.dumps({
            "answer": "Yes, IS 2347 certification is mandatory under the QCO.",
            "summary": None, "applicable_standards": ["IS 2347"],
            "mandatory_status": "Mandatory", "qco_details": None,
            "testing_laboratories": [], "cited_sources": [], "warnings": [],
        })
        context = [
            ConversationTurn(role="user", content="Which standard applies to pressure cookers?"),
            ConversationTurn(role="assistant", content="IS 2347:2017 applies to domestic pressure cookers."),
        ]
        orch = BISOrchestrator()
        # Use a query that will definitely reach the LLM (includes product name + mandatory)
        resp = orch.orchestrate(
            "Is BIS certification mandatory for pressure cookers?",
            context=context,
        )
        assert resp.generation_mode == "bis_rag"
        assert mock_generate.called, "LLM must be called for a BIS RAG query"
        call_args = mock_generate.call_args
        # Extract the prompt from either positional or keyword args
        prompt_used = ""
        if call_args.kwargs:
            prompt_used = call_args.kwargs.get("prompt", "")
        if not prompt_used and call_args.args:
            prompt_used = call_args.args[0]
        assert "pressure cooker" in prompt_used.lower() or "IS 2347" in prompt_used, (
            f"Conversation context must be included in the BIS prompt. Got: {prompt_used[:200]}"
        )

    @patch("app.services.orchestrator.llm_service.generate")
    def test_context_included_in_conversational_prompt(self, mock_generate):
        """Conversation context must also be passed to conversational Gemini calls."""
        mock_generate.return_value = "I'm doing great, thanks for asking!"
        context = [
            ConversationTurn(role="user", content="Hi"),
            ConversationTurn(role="assistant", content="Hello! I'm BIS Agent."),
        ]
        orch = BISOrchestrator()
        orch.orchestrate("How are you?", context=context)
        call_args = mock_generate.call_args
        prompt_used = (
            call_args.kwargs.get("prompt")
            or (call_args.args[0] if call_args.args else "")
        )
        assert "BIS Agent" in prompt_used or "Hello" in prompt_used, (
            "Conversation context must be included in the conversational prompt"
        )

    def test_context_none_does_not_crash(self):
        """Passing no context must not raise any error."""
        orch = BISOrchestrator()
        resp = orch.orchestrate("Hi", context=None)
        assert resp.intent == "GREETING"


class TestAPIConversationContract:
    """End-to-end API contract for conversational and BIS responses."""

    def test_api_greeting_contract(self):
        resp = client.post("/api/chat", json={"message": "Hello"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["intent"] == "GREETING"
        assert data["generation_mode"] == "static"
        assert data["confidence"] is None
        assert data["confidence_level"] is None
        assert data["needs_clarification"] is False
        assert isinstance(data["sources"], list) and len(data["sources"]) == 0

    @patch("app.services.orchestrator.llm_service.generate")
    def test_api_casual_contract(self, mock_generate):
        mock_generate.return_value = "You're welcome!"
        resp = client.post("/api/chat", json={"message": "Thanks"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["intent"] == "CASUAL_CONVERSATION"
        assert data["generation_mode"] == "conversational"
        assert data["confidence"] is None
        assert data["confidence_level"] is None

    def test_api_accepts_context_field(self):
        """API must accept and not crash on an optional context payload."""
        payload = {
            "message": "Hi",
            "context": [
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi there!"},
            ],
        }
        resp = client.post("/api/chat", json=payload)
        assert resp.status_code == 200

    @patch("app.services.orchestrator.llm_service.generate")
    def test_api_bis_query_still_has_confidence(self, mock_generate):
        mock_generate.return_value = json.dumps({
            "answer": "IS 2347 applies to pressure cookers.",
            "summary": None, "applicable_standards": ["IS 2347"],
            "mandatory_status": "Mandatory", "qco_details": None,
            "testing_laboratories": [], "cited_sources": [], "warnings": [],
        })
        resp = client.post("/api/chat", json={"message": "What standard applies to pressure cookers?"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["generation_mode"] == "bis_rag"
        assert data["confidence"] is not None
        assert data["confidence_level"] in ("HIGH", "MEDIUM", "LOW")
