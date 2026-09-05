"""Tests for backend health and root endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Verify root endpoint provides basic service info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "version" in data
    assert data["health"] == "/api/health"


def test_health_endpoint():
    """Verify health endpoint returns status 200 and required fields."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "bis-intelligent-assistant-backend"
    assert data["version"] == "0.1.0"
