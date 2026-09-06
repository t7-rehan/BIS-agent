import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Assistant } from '../pages/Assistant';
import { AppProvider } from '../context/AppContext';
import { aiService } from '../services/aiService';
import { ChatResponse } from '../types/ai';

// Helper to render Assistant inside required providers
const renderAssistant = (initialEntries: string[] = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppProvider>
        <Assistant />
      </AppProvider>
    </MemoryRouter>
  );
};

describe('Assistant Conversational UI (Phase 6)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(aiService, 'checkHealth').mockResolvedValue({ status: 'ok', service: 'bis-assistant-backend' });
  });

  afterEach(() => {
    cleanup();
  });

  // 1. User message rendering
  it('1. renders user message immediately when submitted', async () => {
    const mockQuery = vi.spyOn(aiService, 'queryAssistant').mockResolvedValueOnce({
      answer: 'Response for user',
      needs_clarification: false,
      sources: [],
      evidence_used: [],
      warnings: [],
    });

    renderAssistant();
    const input = screen.getByPlaceholderText(/Ask about a product/i);

    fireEvent.change(input, { target: { value: 'What is IS 2347?' } });
    fireEvent.submit(input.closest('form')!);

    // User message should appear immediately
    expect(screen.getByText('What is IS 2347?')).toBeInTheDocument();
    expect(mockQuery).toHaveBeenCalledWith('What is IS 2347?');

    await waitFor(() => {
      expect(screen.getByText('Response for user')).toBeInTheDocument();
    });
  });

  // 2. Clarification rendering
  it('2. renders clarification card when needs_clarification is true', async () => {
    const clarificationResponse: ChatResponse = {
      answer: 'Please specify the exact standard or product.',
      needs_clarification: true,
      clarifying_question: 'Are you asking about domestic pressure cookers (IS 2347) or industrial autoclaves?',
      confidence_level: 'MEDIUM',
      sources: [],
      evidence_used: [],
      warnings: ['Clarification required'],
    };

    const spy = vi.spyOn(aiService, 'queryAssistant').mockResolvedValueOnce(clarificationResponse);

    renderAssistant();
    const input = screen.getByPlaceholderText(/Ask about a product/i);
    fireEvent.change(input, { target: { value: 'Pressure cooker clarification' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Please specify the exact standard/i)).toBeInTheDocument();
    });
  });

  // 3. API request dispatch
  it('3. dispatches correct API request with trimmed prompt', async () => {
    const querySpy = vi.spyOn(aiService, 'queryAssistant').mockResolvedValueOnce({
      answer: 'Standard details',
      needs_clarification: false,
      sources: [],
      evidence_used: [],
      warnings: [],
    });

    renderAssistant();
    const input = screen.getByPlaceholderText(/Ask about a product/i);
    fireEvent.change(input, { target: { value: '   helmet safety standard   ' } });
    fireEvent.submit(input.closest('form')!);

    expect(querySpy).toHaveBeenCalledWith('helmet safety standard');
  });

  // 4. Loading state / typing indicator
  it('4. displays loading state / typing indicator while waiting for API', async () => {
    let resolvePromise: (val: ChatResponse) => void;
    const promise = new Promise<ChatResponse>((resolve) => {
      resolvePromise = resolve;
    });
    vi.spyOn(aiService, 'queryAssistant').mockReturnValueOnce(promise);

    renderAssistant();
    const input = screen.getByPlaceholderText(/Ask about a product/i);
    fireEvent.change(input, { target: { value: 'Testing query' } });
    fireEvent.submit(input.closest('form')!);

    // Loading indicator should appear
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    expect(
      screen.getByText(/Consulting Indian Standards database/i)
    ).toBeInTheDocument();

    // Resolve API call
    resolvePromise!({
      answer: 'Completed answer',
      needs_clarification: false,
      sources: [],
      evidence_used: [],
      warnings: [],
    });

    await waitFor(() => {
      expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
      expect(screen.getByText('Completed answer')).toBeInTheDocument();
    });
  });

  // 5. Error state on network failure
  it('5. renders user-friendly error state on backend failure', async () => {
    vi.spyOn(aiService, 'queryAssistant').mockRejectedValueOnce(
      new Error('Unable to connect to the BIS assistant right now. Please check that the backend is running and try again.')
    );

    renderAssistant();
    const input = screen.getByPlaceholderText(/Ask about a product/i);
    fireEvent.change(input, { target: { value: 'Query when server is down' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(
        screen.getByText(/Unable to connect to the BIS assistant right now/i)
      ).toBeInTheDocument();
    });
  });

  // 6. Sources rendering with links
  it('6. renders authoritative sources with external clickable links', async () => {
    const responseWithSources: ChatResponse = {
      answer: 'Pressure cooker compliance details.',
      needs_clarification: false,
      confidence_level: 'HIGH',
      sources: [
        {
          title: 'Domestic Pressure Cooker (Quality Control) Order, 2020',
          url: 'https://dpiit.gov.in/sites/default/files/QCO_Pressure_Cooker_2020.pdf',
          source_type: 'BIS_QCO',
          is_number: 'IS 2347:2017',
        },
      ],
      evidence_used: ['Standard: IS 2347:2017'],
      warnings: [],
    };

    vi.spyOn(aiService, 'queryAssistant').mockResolvedValueOnce(responseWithSources);

    renderAssistant();
    const input = screen.getByPlaceholderText(/Ask about a product/i);
    fireEvent.change(input, { target: { value: 'Pressure cooker' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(
        screen.getByText('Domestic Pressure Cooker (Quality Control) Order, 2020')
      ).toBeInTheDocument();
      const link = screen.getByRole('link', { name: /view source/i });
      expect(link).toHaveAttribute(
        'href',
        'https://dpiit.gov.in/sites/default/files/QCO_Pressure_Cooker_2020.pdf'
      );
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  // 7. Confidence rendering
  it('7. renders confidence badge accurately', async () => {
    const responseWithConfidence: ChatResponse = {
      answer: 'Answer with high confidence rating.',
      needs_clarification: false,
      confidence: 0.92,
      confidence_level: 'HIGH',
      sources: [],
      evidence_used: [],
      warnings: [],
    };

    vi.spyOn(aiService, 'queryAssistant').mockResolvedValueOnce(responseWithConfidence);

    renderAssistant();
    const input = screen.getByPlaceholderText(/Ask about a product/i);
    fireEvent.change(input, { target: { value: 'Check confidence' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Confidence: High/i)).toBeInTheDocument();
    });
  });

  // 8. Assistant response rendering
  it('8. renders assistant response when API returns successfully', async () => {
    const sampleResponse: ChatResponse = {
      answer: 'IS 2347:2017 applies to domestic pressure cookers and is mandatory under QCO.',
      intent: 'PRODUCT_STANDARD_QUERY',
      confidence: 0.95,
      confidence_level: 'HIGH',
      needs_clarification: false,
      sources: [],
      evidence_used: ['Standard: IS 2347:2017'],
      warnings: [],
    };

    vi.spyOn(aiService, 'queryAssistant').mockResolvedValueOnce(sampleResponse);

    renderAssistant();
    const input = screen.getByPlaceholderText(/Ask about a product/i);
    fireEvent.change(input, { target: { value: 'Pressure cooker standards' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(
        screen.getByText(/IS 2347:2017 applies to domestic pressure cookers/i)
      ).toBeInTheDocument();
    });
  });

  // 9. Empty evidence handling
  it('9. handles empty / insufficient evidence gracefully without crashing', async () => {
    const insufficientResponse: ChatResponse = {
      answer: 'I could not locate sufficient official BIS evidence regarding your query in the current curated database.',
      needs_clarification: false,
      confidence: 0.0,
      confidence_level: 'INSUFFICIENT_EVIDENCE',
      sources: [],
      evidence_used: [],
      warnings: ['No matching Indian Standards, products, or QCO records found in retrieved knowledge.'],
    };

    vi.spyOn(aiService, 'queryAssistant').mockResolvedValueOnce(insufficientResponse);

    renderAssistant();
    const input = screen.getByPlaceholderText(/Ask about a product/i);
    fireEvent.change(input, { target: { value: 'alien spacecraft standard' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Insufficient Evidence/i)).toBeInTheDocument();
      expect(
        screen.getByText(/I could not locate sufficient official BIS evidence/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/No matching Indian Standards, products, or QCO records found/i)
      ).toBeInTheDocument();
    });
  });

  // 10. Input validation (whitespace / empty rejection)
  it('10. prevents submission of empty or whitespace-only messages', async () => {
    const querySpy = vi.spyOn(aiService, 'queryAssistant');

    renderAssistant();
    const input = screen.getByPlaceholderText(/Ask about a product/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Button should be disabled initially
    expect(sendButton).toBeDisabled();

    // Fill with only whitespace
    fireEvent.change(input, { target: { value: '     ' } });
    expect(sendButton).toBeDisabled();

    fireEvent.submit(input.closest('form')!);
    expect(querySpy).not.toHaveBeenCalled();
  });

  // 11. Duplicate submission prevention
  it('11. prevents duplicate submission while a request is active', async () => {
    let resolvePromise: (val: ChatResponse) => void;
    const pendingPromise = new Promise<ChatResponse>((resolve) => {
      resolvePromise = resolve;
    });
    const querySpy = vi.spyOn(aiService, 'queryAssistant').mockReturnValue(pendingPromise);

    renderAssistant();
    const input = screen.getByPlaceholderText(/Ask about a product/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Single submission test' } });
    fireEvent.click(sendButton);

    expect(querySpy).toHaveBeenCalledTimes(1);

    // Try to click send button again or submit while active
    fireEvent.click(sendButton);
    fireEvent.submit(input.closest('form')!);

    // Should still only be called once
    expect(querySpy).toHaveBeenCalledTimes(1);

    resolvePromise!({
      answer: 'Done',
      needs_clarification: false,
      sources: [],
      evidence_used: [],
      warnings: [],
    });

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  // 12. SIH Demo Query Starters
  it('12. clicking an SIH demo starter card dispatches the recommended query', async () => {
    const querySpy = vi.spyOn(aiService, 'queryAssistant').mockResolvedValueOnce({
      answer: 'IS 2347 applies to domestic pressure cookers.',
      needs_clarification: false,
      sources: [],
      evidence_used: ['Standard: IS 2347'],
      warnings: [],
    });

    renderAssistant();

    // Find and click the "Product → Standard Lookup" demo card
    const starterButton = screen.getByText('Product → Standard Lookup');
    fireEvent.click(starterButton);

    expect(querySpy).toHaveBeenCalledWith('Which Indian Standard applies to pressure cookers?');

    await waitFor(() => {
      expect(screen.getByText('IS 2347 applies to domestic pressure cookers.')).toBeInTheDocument();
    });
  });
});
