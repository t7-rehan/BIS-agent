"""Unit tests for ResponseValidator anti-hallucination guardrails."""

import pytest
from app.models.schemas import EvidencePackage, LLMStructuredAnswer
from app.services.response_validator import response_validator


@pytest.fixture
def sample_evidence():
    """Sample evidence package for testing validation."""
    return EvidencePackage(
        query="What standard applies to plugs?",
        intent="PRODUCT_STANDARD_QUERY",
        structured_facts={
            "standards": [{"is_number": "IS 1293 : 2019", "title": "Plugs and Socket-Outlets"}],
            "products": [{"product_name": "Domestic Plugs and Socket-Outlets"}],
            "qcos": [{"id": "QCO-PLUGS-2020", "name": "Plugs QCO", "mandatory": True}],
        },
        semantic_evidence=[
            {
                "chunk_id": "c1",
                "text": "Plugs and Socket-Outlets are governed by IS 1293 : 2019.",
                "source_title": "IS 1293 Specification",
                "source_url": "https://www.services.bis.gov.in/std/1293",
                "document_type": "standard",
            }
        ],
        sources=[
            {
                "source_title": "IS 1293 Specification",
                "source_url": "https://www.services.bis.gov.in/std/1293",
                "source_type": "BIS_STANDARD",
            }
        ],
        retrieval_confidence=0.85,
        entities={"is_number": "IS 1293"},
    )


def test_validation_valid_response(sample_evidence):
    """Verify clean evidence-grounded response passes with legitimate sources."""
    answer = LLMStructuredAnswer(
        answer="Domestic plugs and socket-outlets must comply with IS 1293 : 2019 under mandatory QCO.",
        summary="Complies with IS 1293.",
        applicable_standards=["IS 1293 : 2019"],
        mandatory_status="Mandatory",
        qco_details="QCO-PLUGS-2020",
        testing_laboratories=[],
        cited_sources=["https://www.services.bis.gov.in/std/1293"],
        warnings=[],
    )

    validated_output, sources, warnings = response_validator.validate(answer, sample_evidence)
    assert validated_output.answer == answer.answer
    assert len(sources) == 1
    assert sources[0].url == "https://www.services.bis.gov.in/std/1293"
    # No unsupported citation warnings
    assert not any("Unverified standard citation" in w for w in warnings)


def test_validation_detects_unsupported_is_number(sample_evidence):
    """Verify hallucinated IS number not present in evidence is flagged."""
    answer = LLMStructuredAnswer(
        answer="Plugs must also comply with IS 99999 : 2099 high voltage spec.",
        summary=None,
        applicable_standards=["IS 99999"],
        mandatory_status=None,
        qco_details=None,
        testing_laboratories=[],
        cited_sources=[],
        warnings=[],
    )

    _, _, warnings = response_validator.validate(answer, sample_evidence)
    assert any("99999" in w for w in warnings)
    assert any("Unverified standard citation" in w for w in warnings)


def test_validation_flags_unsupported_mandatory_claim():
    """Verify mandatory certification claim without QCO evidence is flagged."""
    evidence_without_qco = EvidencePackage(
        query="What is the standard for solar panels?",
        intent="PRODUCT_STANDARD_QUERY",
        structured_facts={"standards": [{"is_number": "IS 14286 : 2010"}]},
        semantic_evidence=[],
        sources=[],
        retrieval_confidence=0.5,
        entities={},
    )

    answer = LLMStructuredAnswer(
        answer="Solar modules have mandatory certification and manufacturers must obtain ISI mark.",
        summary=None,
        applicable_standards=["IS 14286"],
        mandatory_status="Mandatory",
        qco_details=None,
        testing_laboratories=[],
        cited_sources=[],
        warnings=[],
    )

    _, _, warnings = response_validator.validate(answer, evidence_without_qco)
    assert any("Mandatory certification is claimed, but no specific Quality Control Order" in w for w in warnings)


def test_validation_empty_answer_replaced_with_fallback(sample_evidence):
    """Verify empty answer string is substituted with safe fallback message."""
    answer = LLMStructuredAnswer(
        answer="   ",
        summary=None,
        applicable_standards=[],
        mandatory_status=None,
        qco_details=None,
        testing_laboratories=[],
        cited_sources=[],
        warnings=[],
    )

    validated_output, _, warnings = response_validator.validate(answer, sample_evidence)
    assert "could not locate sufficient official BIS evidence" in validated_output.answer
    assert any("Original model response was empty" in w for w in warnings)
