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
    """Service to process user chat queries via the AI Orchestrator."""

    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        """Process a chat query through the evidence-grounded AI pipeline.

        Args:
            request: The validated user query.

        Returns:
            ChatResponse: Structured response with answer, intent, sources, and confidence.
        """
        logger.info("Processing chat query: %s", request.message[:80])
        from app.services.orchestrator import orchestrator
        return orchestrator.orchestrate(request.message)


chat_service = ChatService()
