import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ClarificationCardProps {
  question: string;
  onSelectOption?: (option: string) => void;
  options?: string[];
}

export const ClarificationCard: React.FC<ClarificationCardProps> = ({
  question,
  onSelectOption,
  options = [],
}) => {
  return (
    <div className="mt-2 space-y-3" data-testid="clarification-card">
      {/* The question is rendered inline as part of the answer text — this card
          provides actionable options if available */}
      {options.length > 0 && onSelectOption && (
        <div className="flex flex-wrap gap-2 pt-1">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectOption(opt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg transition-all cursor-pointer"
            >
              <span>{opt}</span>
              <ArrowRight className="w-3 h-3 opacity-60" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
