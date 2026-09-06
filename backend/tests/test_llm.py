"""Unit tests for GeminiLLMService with mocked client."""

import json
from unittest.mock import MagicMock, patch
import pytest

from app.models.schemas import LLMStructuredAnswer
from app.services.llm_service import GeminiLLMService, LLMError


def test_llm_offline_fallback():
    """Verify LLM service operates in offline fallback when API key is None."""
    service = GeminiLLMService(api_key=None, mock_mode=True)
    assert not service.is_configured

    output_json = service.generate(
        prompt="What is IS 1293?",
        system_instruction="System prompt",
        response_schema=LLMStructuredAnswer,
    )
    parsed = json.loads(output_json)
    assert "answer" in parsed
    assert len(parsed["answer"]) > 0
    assert "offline" in parsed["warnings"][0].lower()


def test_llm_mock_successful_generation():
    """Verify successful generation with a mocked Gemini client."""
    service = GeminiLLMService(api_key="mock_test_key", mock_mode=False)

    # Mock client and response
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "answer": "Domestic plugs and sockets must comply with IS 1293 : 2019.",
        "summary": "Governed by IS 1293.",
        "applicable_standards": ["IS 1293 : 2019"],
        "mandatory_status": "Mandatory",
        "qco_details": "Plugs and Socket-Outlets QCO, 2020",
        "testing_laboratories": ["BIS Central Laboratory"],
        "cited_sources": ["https://www.bis.gov.in"],
        "warnings": [],
    })
    mock_client.models.generate_content.return_value = mock_response
    service._client = mock_client

    result_str = service.generate(
        prompt="Tell me about plugs and sockets",
        system_instruction="System instruction",
        response_schema=LLMStructuredAnswer,
    )
    parsed = json.loads(result_str)
    assert "IS 1293 : 2019" in parsed["applicable_standards"]
    assert parsed["mandatory_status"] == "Mandatory"


def test_llm_api_failure_raises_llm_error():
    """Verify Gemini API errors are caught and re-raised as LLMError."""
    service = GeminiLLMService(api_key="mock_test_key", mock_mode=False)
    mock_client = MagicMock()
    mock_client.models.generate_content.side_effect = Exception("Connection reset by peer")
    service._client = mock_client

    with pytest.raises(LLMError) as exc_info:
        service.generate("prompt", "system")
    assert "Gemini API failure" in str(exc_info.value)


def test_llm_empty_response_raises_llm_error():
    """Verify empty response from Gemini raises LLMError."""
    service = GeminiLLMService(api_key="mock_test_key", mock_mode=False)
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = ""
    mock_client.models.generate_content.return_value = mock_response
    service._client = mock_client

    with pytest.raises(LLMError) as exc_info:
        service.generate("prompt", "system")
    assert "empty response" in str(exc_info.value)
