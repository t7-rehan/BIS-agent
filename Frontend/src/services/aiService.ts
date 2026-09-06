import { ChatResponse } from '../types/ai';

const RAW_API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
// Remove trailing slashes for clean endpoint concatenation
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

export interface HealthCheckResult {
  status: string;
  service: string;
  version?: string;
}

export class AssistantApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'AssistantApiError';
    this.statusCode = statusCode;
  }
}

/**
 * AI Service communicating with the FastAPI /api/chat endpoint.
 * Implements strict zero-mock policy per Phase 6 requirements.
 */
export const aiService = {
  /**
   * Health check for backend service liveness.
   */
  async checkHealth(): Promise<HealthCheckResult | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        return (await response.json()) as HealthCheckResult;
      }
    } catch {
      // Backend not yet reachable or offline
    }
    return null;
  },

  /**
   * Send user prompt to POST /api/chat and return validated ChatResponse.
   *
   * @param message User question or prompt
   * @param timeoutMs Request timeout (default: 35000ms)
   * @returns Validated ChatResponse from Phase 5 Orchestrator
   */
  async queryAssistant(
    message: string,
    timeoutMs: number = 35000
  ): Promise<ChatResponse> {
    const cleanMessage = message.trim();
    if (!cleanMessage) {
      throw new AssistantApiError('Message cannot be empty or contain only whitespace.');
    }
    if (cleanMessage.length > 2000) {
      throw new AssistantApiError('Message is too long. Please keep queries under 2000 characters.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ message: cleanMessage }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 422) {
          const errorBody = await response.json().catch(() => null);
          const detail = errorBody?.detail?.[0]?.msg || 'Validation error with message input.';
          throw new AssistantApiError(`Invalid query: ${detail}`, 422);
        }
        if (response.status >= 500) {
          throw new AssistantApiError(
            'The BIS Assistant service encountered an internal error. Please try again later.',
            response.status
          );
        }
        throw new AssistantApiError(
          `Request failed with status ${response.status}. Please check your query and try again.`,
          response.status
        );
      }

      const data = await response.json();
      if (!data || typeof data.answer !== 'string') {
        throw new AssistantApiError('Received an empty or malformed response from the assistant.');
      }

      // Normalize into strongly typed ChatResponse
      const chatResponse: ChatResponse = {
        answer: data.answer,
        intent: data.intent || 'GENERAL_QUERY',
        confidence: data.confidence ?? null,
        confidence_level: data.confidence_level || (data.confidence !== null ? 'HIGH' : null),
        needs_clarification: Boolean(data.needs_clarification),
        clarifying_question: data.clarifying_question || null,
        sources: Array.isArray(data.sources) ? data.sources : [],
        evidence_used: Array.isArray(data.evidence_used) ? data.evidence_used : [],
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
        entities: data.entities && typeof data.entities === 'object' ? data.entities : {},
      };

      return chatResponse;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof AssistantApiError) {
        throw err;
      }

      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new AssistantApiError(
          'Request timed out. The knowledge retrieval or AI synthesis took longer than expected. Please try again.'
        );
      }

      // Network / connection failure
      throw new AssistantApiError(
        'Unable to connect to the BIS assistant right now. Please check that the backend is running and try again.'
      );
    }
  },
};
