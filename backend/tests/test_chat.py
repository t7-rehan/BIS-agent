"""Tests for the chat API endpoint and validation."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_chat_valid_message():
    """Verify POST /api/chat handles valid input and returns expected schema."""
    payload = {"message": "What BIS standard applies to electric mixers?"}
    response = client.post("/api/chat", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 0
    assert "Backend connection is working" in data["answer"]
    assert data["intent"] == "GENERAL_QUERY"
    assert isinstance(data["sources"], list)
    assert len(data["sources"]) == 0
    assert data["confidence"] is None


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
