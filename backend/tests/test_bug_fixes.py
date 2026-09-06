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
        """BUG FIX: LLM failure answer must contain the expected degradation message."""
        mock_generate.side_effect = Exception("Unexpected upstream error")

        orchestrator = BISOrchestrator()
        response = orchestrator.orchestrate("What is the standard for pressure cookers?")

        assert "error occurred while communicating with the ai generation model" in response.answer.lower()

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

        assert "error occurred" in data["answer"].lower()

    @patch("app.services.orchestrator.llm_service.generate")
    def test_api_sources_present_on_llm_failure(self, mock_generate):
        """BUG FIX: /api/chat must still return retrieved sources when LLM fails."""
        mock_generate.side_effect = LLMError("Network error")

        response = client.post("/api/chat", json={"message": "Standard for electric food mixers?"})
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data["sources"], list)
        assert len(data["sources"]) > 0, "Verified sources must be returned even on LLM failure"
