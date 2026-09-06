"""Tests for the chat API endpoint and validation."""

import json
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@patch("app.services.orchestrator.llm_service.generate")
def test_chat_valid_message(mock_generate):
    """Verify POST /api/chat handles valid input and returns full Phase 5 schema."""
    mock_generate.return_value = json.dumps({
        "answer": "Electric food mixers are governed by Indian Standard IS 302 (Part 2/Sec 14) : 2009.",
        "summary": "Governed by IS 302.",
        "applicable_standards": ["IS 302 (Part 2/Sec 14) : 2009"],
        "mandatory_status": "Mandatory",
        "qco_details": "Electrical Appliances QCO 2024",
        "testing_laboratories": [],
        "cited_sources": [],
        "warnings": [],
    })

    payload = {"message": "What BIS standard applies to electric food mixers?"}
    response = client.post("/api/chat", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 0
    assert "IS 302" in data["answer"]
    assert data["intent"] == "PRODUCT_STANDARD_QUERY"
    assert isinstance(data["sources"], list)
    assert len(data["sources"]) > 0
    assert data["confidence"] is not None
    assert "confidence_level" in data
    assert data["needs_clarification"] is False


def test_chat_underspecified_message_triggers_clarification():
    """Verify underspecified query through /api/chat returns needs_clarification=True."""
    payload = {"message": "Which standard applies to my product?"}
    response = client.post("/api/chat", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["needs_clarification"] is True
    assert data["clarifying_question"] is not None
    assert "product name" in data["clarifying_question"].lower()


def test_chat_empty_message():
    """Verify empty string message is rejected with 422."""
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


def test_chat_whitespace_only_message():
    """Verify whitespace-only message is rejected with 422."""
    response = client.post("/api/chat", json={"message": "   \n\t  "})
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


def test_chat_missing_message_field():
    """Verify request without 'message' field is rejected with 422."""
    response = client.post("/api/chat", json={})
    assert response.status_code == 422


def test_chat_non_string_message():
    """Verify non-string message (e.g. integer) is rejected with 422."""
    response = client.post("/api/chat", json={"message": 12345})
    assert response.status_code == 422


def test_chat_excessive_length_message():
    """Verify message exceeding 2000 characters is rejected with 422."""
    oversized_message = "A" * 2001
    response = client.post("/api/chat", json={"message": oversized_message})
    assert response.status_code == 422
