import { AIStructuredResponse } from '../types/ai';
import { getMockAIResponse } from '../data/mockAIResponses';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || '';

export interface ChatApiResponse {
  answer: string;
  intent?: string;
  sources?: any[];
  confidence?: number | null;
}

/**
 * AI Service abstraction.
 * Connects to FastAPI POST /api/chat when VITE_API_URL is configured,
 * with fallback to mock AI responses for resilient local development.
 */
export const aiService = {
  async checkHealth(): Promise<{ status: string; service: string; version?: string } | null> {
    if (!API_BASE_URL) return null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend health check failed:', err);
    }
    return null;
  },

  async queryAssistant(
    prompt: string,
    evidenceMode: boolean = true
  ): Promise<AIStructuredResponse | ChatApiResponse> {
    if (API_BASE_URL) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt })
        });

        if (response.ok) {
          const data: ChatApiResponse = await response.json();
          return data;
        }
      } catch (err) {
        console.warn('Backend request failed, falling back to mock response:', err);
      }
    }

    // Simulate network latency (400ms - 800ms) for realistic UX in mock mode
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = getMockAIResponse(prompt);
    if (!evidenceMode) {
      return {
        ...result,
        sources: [],
        reasoningPipeline: []
      };
    }
    return result;
  }
};

