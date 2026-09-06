import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

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
    <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl text-left space-y-3 shadow-2xs">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
          <HelpCircle className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
          Clarification Required
        </span>
      </div>

      <div className="text-sm font-medium text-slate-800 leading-relaxed pl-8">
        {question}
      </div>

      {options.length > 0 && onSelectOption && (
        <div className="pl-8 pt-1 flex flex-wrap gap-2">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectOption(opt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-white hover:bg-amber-100/80 border border-amber-300 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <span>{opt}</span>
              <ArrowRight className="w-3 h-3 text-amber-600" />
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-amber-700/80 pl-8 italic">
        Tip: Please reply with additional details in the chat input below.
      </p>
    </div>
  );
};
