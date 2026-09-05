import { AIStructuredResponse } from '../types/ai';
import { getMockAIResponse } from '../data/mockAIResponses';

/**
 * AI Service abstraction.
 * Currently uses simulated AI engine; ready to swap with FastAPI `POST /api/chat`
 */
export const aiService = {
  async queryAssistant(prompt: string, evidenceMode: boolean = true): Promise<AIStructuredResponse> {
    // Simulate network latency (400ms - 800ms) for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Future FastAPI endpoint:
    // const response = await fetch('/api/chat', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ prompt, evidenceMode })
    // });
    // return response.json();

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
