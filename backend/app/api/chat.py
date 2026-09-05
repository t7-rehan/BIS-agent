"""Chat endpoint providing the conversational interface foundation."""

from fastapi import APIRouter, status
from app.models.schemas import ChatRequest, ChatResponse
from app.services.chat_service import chat_service

router = APIRouter(tags=["Chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Process User Query",
    description=(
        "Accepts a user query regarding BIS standards and returns a structured "
        "response. In Phase 1, returns a foundation placeholder response."
    ),
)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """Handle chat requests and delegate to ChatService."""
    return await chat_service.process_chat(request)
