"""Tests for conversational flow, multi-turn follow-ups, and natural interactions."""

import pytest
from app.models.schemas import ConversationTurn
from app.services.orchestrator import orchestrator
from app.services.intent_service import intent_service


def test_greeting_instant_and_friendly():
    """Verify greetings return warm, instant replies without database retrieval."""
    greetings = ["Hi", "Hello", "Hey there!", "Good morning", "Namaste"]
    for g in greetings:
        resp = orchestrator.orchestrate(g)
        assert resp.intent == "GREETING"
        assert resp.confidence_level is None
        assert resp.sources == []
        assert resp.evidence_used == []
        assert resp.needs_clarification is False
        assert len(resp.answer) > 5
        assert "BIS Agent" in resp.answer or "help" in resp.answer.lower()


def test_casual_small_talk():
    """Verify casual exchanges return natural human-like responses without errors."""
    queries = [
        "How are you?",
        "Thank you so much!",
        "Thanks for your help",
        "What can you do?",
        "Can you help me?",
    ]
    for q in queries:
        resp = orchestrator.orchestrate(q)
        assert resp.intent == "CASUAL_CONVERSATION"
        assert resp.confidence_level is None
        assert resp.sources == []
        assert resp.needs_clarification is False
        assert len(resp.answer) > 10
        # Must not expose internal error strings
        assert "UNKNOWN_QUERY" not in resp.answer
        assert "INSUFFICIENT_EVIDENCE" not in resp.answer


def test_general_knowledge_answers_and_connects_to_bis():
    """Verify general questions return helpful answers connecting to BIS."""
    resp = orchestrator.orchestrate("What is ISO?")
    assert resp.intent == "GENERAL_INFORMATION"
    assert resp.confidence_level is None
    assert "iso" in resp.answer.lower() or "international" in resp.answer.lower()
    assert "bis" in resp.answer.lower() or "standard" in resp.answer.lower()


def test_ambiguous_query_natural_clarification():
    """Verify single-word ambiguous query triggers natural clarification with options."""
    resp = orchestrator.orchestrate("cooker")
    assert resp.needs_clarification is True
    assert resp.clarifying_question is not None
    assert "type of cooker" in resp.clarifying_question.lower() or "what type" in resp.clarifying_question.lower()
    assert resp.entities.get("clarification_options") is not None
    assert "Domestic pressure cooker" in resp.entities["clarification_options"]
    assert resp.sources == []


def test_multi_turn_follow_up_sequence():
    """Verify multi-turn follow-up sequence:
    Turn 1: Standard lookup ('Which standard applies to pressure cookers?')
    Turn 2: Follow-up mandate ('Is it mandatory?')
    Turn 3: Follow-up lab query ('Where can I get it tested?')
    """
    # Turn 1: Initial query
    t1_query = "Which Indian Standard applies to pressure cookers?"
    t1_resp = orchestrator.orchestrate(t1_query)

    assert t1_resp.intent == "PRODUCT_STANDARD_QUERY"
    assert "IS 2347" in t1_resp.answer or any("IS 2347" in s for s in t1_resp.evidence_used)
    assert t1_resp.needs_clarification is False

    context = [
        ConversationTurn(role="user", content=t1_query),
        ConversationTurn(role="assistant", content=t1_resp.answer),
    ]

    # Turn 2: Follow-up without naming the product ('Is it mandatory?')
    t2_query = "Is it mandatory?"
    t2_intent = intent_service.detect_intent(t2_query, context=context)
    assert t2_intent.intent == "QCO_COMPLIANCE_QUERY"
    assert t2_intent.entities.get("product_id") == "PROD-PRESSURE-COOKER"
    assert t2_intent.entities.get("is_number") == "IS 2347"

    t2_resp = orchestrator.orchestrate(t2_query, context=context)
    assert t2_resp.intent == "QCO_COMPLIANCE_QUERY"
    assert t2_resp.needs_clarification is False
    # Must confirm mandatory status under Domestic Pressure Cooker QCO
    answer_text = (t2_resp.answer + " " + " ".join(t2_resp.evidence_used)).lower()
    assert "mandatory" in answer_text or "compulsory" in answer_text
    assert "2347" in answer_text or "pressure cooker" in answer_text

    context += [
        ConversationTurn(role="user", content=t2_query),
        ConversationTurn(role="assistant", content=t2_resp.answer),
    ]

    # Turn 3: Follow-up lab testing query ('Where can I get it tested?')
    t3_query = "Where can I get it tested?"
    t3_intent = intent_service.detect_intent(t3_query, context=context)
    assert t3_intent.intent == "LABORATORY_QUERY"
    assert t3_intent.entities.get("product_id") == "PROD-PRESSURE-COOKER"

    t3_resp = orchestrator.orchestrate(t3_query, context=context)
    assert t3_resp.intent == "LABORATORY_QUERY"
    assert t3_resp.needs_clarification is False
    assert len(t3_resp.answer) > 20
    # Must provide laboratory or testing guidance without hallucinated fake standards
    assert "IS 9999" not in t3_resp.answer
