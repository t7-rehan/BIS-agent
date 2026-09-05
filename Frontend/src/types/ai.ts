export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'INSUFFICIENT';

export interface SourceCitation {
  id: string;
  sourceType: 'Indian Standard' | 'QCO Gazette Notification' | 'BIS Scheme Manual' | 'Laboratory Guideline';
  title: string;
  reference: string; // e.g. "Clause 5.2.1"
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
  confidenceScore: number; // e.g. 94
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
  structuredResponse?: AIStructuredResponse;
  isStreaming?: boolean;
}
