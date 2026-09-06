"""Integration and orchestration tests for BISOrchestrator with mocked LLM."""

import json
from unittest.mock import patch
import pytest

from app.models.schemas import ChatResponse, LLMStructuredAnswer
from app.services.orchestrator import BISOrchestrator


@pytest.fixture
def orchestrator_instance():
    """Shared BISOrchestrator instance."""
    return BISOrchestrator()


def test_orchestrator_clarification_flow(orchestrator_instance):
    """Verify underspecified query returns clarification response without calling LLM."""
    response = orchestrator_instance.orchestrate("Which standard applies to my product?")
    assert isinstance(response, ChatResponse)
    assert response.needs_clarification is True
    assert response.clarifying_question is not None
    assert "specify the product name" in response.clarifying_question.lower()
    assert len(response.sources) == 0


def test_orchestrator_insufficient_evidence_flow(orchestrator_instance):
    """Verify query for nonexistent topic returns safe insufficient evidence message."""
    response = orchestrator_instance.orchestrate("What is the BIS standard for extraterrestrial starships?")
    assert isinstance(response, ChatResponse)
    assert response.confidence_level == "INSUFFICIENT_EVIDENCE"
    assert "could not locate sufficient official BIS evidence" in response.answer
    assert len(response.sources) == 0


@patch("app.services.orchestrator.llm_service.generate")
def test_orchestrator_successful_product_query(mock_generate, orchestrator_instance):
    """Verify full end-to-end orchestration for a product query."""
    mock_generate.return_value = json.dumps({
        "answer": "Electric food mixers and kitchen grinders are governed by IS 302 (Part 2/Sec 14) : 2009.",
        "summary": "Governed by IS 302.",
        "applicable_standards": ["IS 302 (Part 2/Sec 14) : 2009"],
        "mandatory_status": "Mandatory",
        "qco_details": "Electrical Appliances QCO 2024",
        "testing_laboratories": ["BIS Central Laboratory"],
        "cited_sources": [],
        "warnings": [],
    })

    response = orchestrator_instance.orchestrate("What Indian Standard applies to electric food mixers?")
    assert isinstance(response, ChatResponse)
    assert "IS 302" in response.answer
    assert response.intent == "PRODUCT_STANDARD_QUERY"
    assert response.confidence > 0.0
    assert len(response.sources) > 0
    assert any("302" in s.title or "Mixer" in s.title for s in response.sources)
    assert not response.needs_clarification


@patch("app.services.orchestrator.llm_service.generate")
def test_orchestrator_standard_lookup_flow(mock_generate, orchestrator_instance):
    """Verify standard lookup queries retrieve correct standard and citations."""
    mock_generate.return_value = json.dumps({
        "answer": "IS 1293 : 2019 covers domestic plugs and socket-outlets rated up to 250V.",
        "summary": "Covers plugs and sockets.",
        "applicable_standards": ["IS 1293 : 2019"],
        "mandatory_status": "Mandatory",
        "qco_details": "Plugs QCO 2020",
        "testing_laboratories": [],
        "cited_sources": [],
        "warnings": [],
    })

    response = orchestrator_instance.orchestrate("What is IS 1293 : 2019?")
    assert isinstance(response, ChatResponse)
    assert response.intent == "STANDARD_LOOKUP"
    assert "IS 1293" in response.answer
    assert len(response.sources) > 0


@patch("app.services.orchestrator.llm_service.generate")
def test_orchestrator_handles_llm_exception_gracefully(mock_generate, orchestrator_instance):
    """Verify that an unexpected LLM exception does not crash the orchestrator."""
    mock_generate.side_effect = Exception("LLM connection timed out")

    response = orchestrator_instance.orchestrate("What standard applies to electric food mixers?")
    assert isinstance(response, ChatResponse)
    assert "error occurred while communicating with the ai generation model" in response.answer.lower()
    # Official retrieved sources are still preserved
    assert len(response.sources) > 0
    assert any("LLM generation warning" in w for w in response.warnings)
