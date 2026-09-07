"""Chat Service — thin delegation layer between the API and the Orchestrator."""

import logging
from app.models.schemas import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)


class ChatService:
    """Process user chat queries via the AI Orchestrator."""

    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        """Delegate to the central orchestrator, forwarding any conversation context.

        Args:
            request: Validated ChatRequest (message + optional context turns).

        Returns:
            ChatResponse: Fully populated response from the orchestrator pipeline.
        """
        logger.info("[ChatService] Processing: %s", request.message[:80])
        from app.services.orchestrator import orchestrator
        return orchestrator.orchestrate(
            message=request.message,
            context=request.context,
        )


chat_service = ChatService()
