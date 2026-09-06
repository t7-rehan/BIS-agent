"""Automated SIH MVP Evaluation Benchmark Test Suite.

Executes structured evaluation test cases from `evaluation_queries.json`
across all 10 core SIH behavioral categories, validating:
1. Intent classification accuracy
2. Entity extraction and standard citation grounding
3. Clarification behavior on ambiguous / underspecified queries
4. Anti-hallucination guarantees on out-of-scope / low evidence queries
5. Source URL legitimacy and verification
6. Confidence level consistency (HIGH, MEDIUM, LOW, INSUFFICIENT_EVIDENCE)
"""

import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.orchestrator import orchestrator

client = TestClient(app)

EVALUATION_DATA_PATH = Path(__file__).resolve().parent / "evaluation_queries.json"


def load_evaluation_cases():
    """Load the curated 20-case SIH evaluation dataset."""
    with open(EVALUATION_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


EVALUATION_CASES = load_evaluation_cases()


@pytest.mark.parametrize("case", EVALUATION_CASES, ids=[c["id"] for c in EVALUATION_CASES])
def test_sih_evaluation_case_orchestration(case):
    """Execute evaluation case through the central AI Orchestrator."""
    query = case["query"]
    expected_intent = case["expected_intent"]
    requires_clarification = case.get("requires_clarification", False)

    response = orchestrator.orchestrate(query)

    # 1. Intent Validation
    assert response.intent == expected_intent, (
        f"[{case['id']}] Expected intent '{expected_intent}', got '{response.intent}'"
    )

    # 2. Clarification Validation
    assert response.needs_clarification is requires_clarification, (
        f"[{case['id']}] Expected needs_clarification={requires_clarification}, got {response.needs_clarification}"
    )
    if requires_clarification:
        assert response.clarifying_question is not None
        assert len(response.clarifying_question.strip()) > 10
        assert response.confidence_level in ["MEDIUM", "LOW"]

    # 3. Expected Standards Grounding
    if "expected_standards" in case:
        for expected_std in case["expected_standards"]:
            evidence_text = (
                response.answer + " "
                + " ".join(response.evidence_used) + " "
                + " ".join(s.title + " " + s.url for s in response.sources)
            )
            assert expected_std in evidence_text, (
                f"[{case['id']}] Expected standard '{expected_std}' missing from response and evidence."
            )

    # 4. Anti-Hallucination & Low Evidence Validation
    if case["category"] == "LOW_EVIDENCE":
        assert response.confidence_level in ["INSUFFICIENT_EVIDENCE", "LOW"]
        # Must not fabricate an IS number in the answer
        import re
        is_matches = re.findall(r"\bIS\s+\d+\b", response.answer)
        assert len(is_matches) == 0, (
            f"[{case['id']}] Hallucinated IS number found in low evidence query: {is_matches}"
        )
        assert "bis.gov.in" in response.answer.lower() or "insufficient" in response.answer.lower()

    # 5. Verified Source Legitimacy
    for source in response.sources:
        assert source.url.startswith("http://") or source.url.startswith("https://")
        # Official Indian government, BIS, and recognized institute domains check
        assert any(
            domain in source.url
            for domain in [
                ".gov.in", ".nic.in", ".res.in",
                "manakonline.in", "crsbis.in", "shriraminstitute.org",
                "ncbindia.com", "nplindia.org", "araiindia.com", "icat.in"
            ]
        ), f"[{case['id']}] Untrusted or fabricated source domain: {source.url}"


def test_sih_api_chat_endpoint_contract():
    """Verify live HTTP API /api/chat adheres strictly to the SIH response contract."""
    test_queries = [
        ("What Indian Standard applies to pressure cookers?", 200, False),
        ("cooker", 200, True),
        ("Which standard applies to my product?", 200, True),
        ("What Indian Standard applies to commercial interstellar quantum spaceships?", 200, False),
    ]

    for query, expected_status, expected_clarification in test_queries:
        res = client.post("/api/chat", json={"message": query})
        assert res.status_code == expected_status
        data = res.json()
        assert "answer" in data
        assert "intent" in data
        assert "confidence" in data
        assert "confidence_level" in data
        assert "needs_clarification" in data
        assert "sources" in data
        assert "evidence_used" in data
        assert "warnings" in data
        assert "entities" in data
        assert data["needs_clarification"] is expected_clarification
