"""Health check endpoint to verify backend service availability."""

from fastapi import APIRouter, status
from app.core.config import settings
from app.models.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Health Check",
    description="Returns backend liveness status, service identity, and version.",
)
async def check_health() -> HealthResponse:
    """Return backend health status."""
    return HealthResponse(
        status="ok",
        service="bis-intelligent-assistant-backend",
        version=settings.APP_VERSION,
    )
