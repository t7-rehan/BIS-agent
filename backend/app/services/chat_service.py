"""Chat Service handling query orchestration.

In Phase 1, this service acts as the clean abstraction layer providing a placeholder
response to establish end-to-end connectivity. In subsequent phases, this service
will orchestrate:
  - Intent detection
  - Query classification
  - Hybrid RAG retrieval
  - LLM response synthesis
  - Evidence & citation validation
"""

import logging
from app.models.schemas import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)


class ChatService:
    """Service to process user chat queries."""

    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        """Process a chat query and return a structured response.

        Args:
            request: The validated user query.

        Returns:
            ChatResponse: Structured response with answer, intent, sources, and confidence.
        """
        logger.info("Processing chat query: %s", request.message[:80])

        # Phase 1: Clean placeholder response validating backend foundation
        return ChatResponse(
            answer="Backend connection is working. AI and BIS knowledge retrieval will be added in later phases.",
            intent="GENERAL_QUERY",
            sources=[],
            confidence=None,
        )


chat_service = ChatService()
