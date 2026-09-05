import React, { useState } from 'react';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, FileText, CheckCircle2 } from 'lucide-react';
import { SourceCitation } from '../../types/ai';

interface SourceCardProps {
  source: SourceCitation;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSourceIcon = (type: SourceCitation['sourceType']) => {
    switch (type) {
      case 'Indian Standard':
        return <BookOpen className="w-3.5 h-3.5 text-blue-600" />;
      case 'QCO Gazette Notification':
        return <FileText className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-subtle hover:border-slate-300 transition-all text-left">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
            {getSourceIcon(source.sourceType)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">{source.title}</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
                {source.sourceType}
              </span>
            </div>
            <p className="text-xs font-medium text-blue-700 mt-0.5">{source.reference}</p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
          title="Toggle excerpt"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Citation snippet */}
      <div className={`mt-2 text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-2.5 rounded-lg border border-slate-100 ${!isExpanded ? 'line-clamp-2' : ''}`}>
        “{source.excerpt}”
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Verified Reference: {source.dateOrVersion}</span>
        <button
          onClick={() => alert(`Viewing official verified citation for ${source.title} (${source.reference})`)}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
        >
          <span>View Source</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
