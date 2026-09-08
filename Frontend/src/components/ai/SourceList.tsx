import React, { useState } from 'react';
import { BookOpen, FileText, ExternalLink, ShieldCheck, ChevronDown, ChevronUp, Award, Building2 } from 'lucide-react';
import { SourceItem } from '../../types/ai';

interface SourceListProps {
  sources: SourceItem[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!sources || sources.length === 0) return null;

  const getSourceIcon = (sourceType: string) => {
    const t = (sourceType || '').toUpperCase();
    if (t.includes('STANDARD')) return <BookOpen className="w-3.5 h-3.5 text-blue-600" />;
    if (t.includes('QCO')) return <FileText className="w-3.5 h-3.5 text-amber-600" />;
    if (t.includes('LAB')) return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
    return <Award className="w-3.5 h-3.5 text-emerald-600" />;
  };

  const formatSourceType = (sourceType: string) => {
    const t = (sourceType || '').toUpperCase();
    if (t.includes('STANDARD')) return 'IS';
    if (t.includes('QCO')) return 'QCO';
    if (t.includes('LAB')) return 'Lab';
    if (t.includes('SCHEME')) return 'Scheme';
    if (t.includes('SERVICE')) return 'Service';
    return 'BIS';
  };

  const displayedSources = isExpanded ? sources : sources.slice(0, 3);
  const hasMore = sources.length > 3;

  return (
    <div className="pt-3 border-t border-slate-100">
      {/* Collapsed trigger — always shown */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Hide sources' : `View ${sources.length} source${sources.length !== 1 ? 's' : ''}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
        <span className="group-hover:underline underline-offset-2">
          {isExpanded ? 'Hide sources' : `View sources (${sources.length})`}
        </span>
        {isExpanded
          ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          : <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        }
      </button>

      {/* Expanded source list */}
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {displayedSources.map((source, index) => {
            const hasUrl = Boolean(source.url && source.url.startsWith('http'));
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {getSourceIcon(source.source_type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none">
                        {source.title}
                      </span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-white border border-slate-200 rounded shrink-0">
                        {formatSourceType(source.source_type)}
                      </span>
                      {source.is_number && (
                        <span className="text-[10px] font-mono font-semibold text-blue-700 px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded shrink-0">
                          {source.is_number}
                        </span>
                      )}
                    </div>
                    {source.section && (
                      <p className="text-[11px] text-slate-400 mt-0.5">§ {source.section}</p>
                    )}
                  </div>
                </div>

                {hasUrl ? (
                  <a
                    href={source.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 shrink-0 focus:outline-none focus:underline"
                    aria-label={`View source: ${source.title}`}
                  >
                    <span>View source</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            );
          })}

          {hasMore && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 pt-1"
            >
              +{sources.length - 3} more
            </button>
          )}
        </div>
      )}
    </div>
  );
};
