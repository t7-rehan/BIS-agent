export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT' | 'INSUFFICIENT_EVIDENCE';

/** Authoritative BIS/Government reference source from backend */
export interface SourceItem {
  title: string;
  url?: string | null;
  source_type: string;
  section?: string | null;
  is_number?: string | null;
}

/** Comprehensive chat response schema returned by FastAPI /api/chat */
export interface ChatResponse {
  answer: string;
  intent?: string;
  confidence?: number | string | null;
  confidence_level?: ConfidenceLevel | string | null;
  needs_clarification: boolean;
  clarifying_question?: string | null;
  sources: SourceItem[];
  evidence_used: string[];
  warnings: string[];
  entities?: Record<string, any>;
}

export interface SourceCitation {
  id: string;
  sourceType: 'Indian Standard' | 'QCO Gazette Notification' | 'BIS Scheme Manual' | 'Laboratory Guideline';
  title: string;
  reference: string;
  excerpt: string;
  dateOrVersion: string;
  url?: string;
}

export interface ReasoningStep {
  step: number;
  name: string;
  description: string;
  status: 'completed' | 'processing' | 'pending';
  outputSnippet?: string;
}

export interface AIStructuredResponse {
  productIdentified: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  summary: string;
  applicableStandards: {
    code: string;
    id: string;
    title: string;
    matchScore: string;
    isMandatory: boolean;
  }[];
  regulatoryStatus: {
    isMandatory: boolean;
    orderName?: string;
    effectiveDate?: string;
    enforcingMinistry?: string;
  };
  keyRequirements: {
    category: string;
    points: string[];
  }[];
  testingProtocols: string[];
  nextActions: {
    step: number;
    action: string;
    description: string;
    targetRoute?: string;
    actionLabel?: string;
  }[];
  sources: SourceCitation[];
  reasoningPipeline: ReasoningStep[];
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  chatResponse?: ChatResponse;
  structuredResponse?: AIStructuredResponse;
  isStreaming?: boolean;
  error?: boolean;
}

