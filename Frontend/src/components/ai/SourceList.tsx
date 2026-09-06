import React, { useState } from 'react';
import { BookOpen, FileText, ExternalLink, ShieldCheck, ChevronDown, ChevronUp, Award, Building2 } from 'lucide-react';
import { SourceItem } from '../../types/ai';

interface SourceListProps {
  sources: SourceItem[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  const getSourceIcon = (sourceType: string) => {
    const typeUpper = (sourceType || '').toUpperCase();
    if (typeUpper.includes('STANDARD')) {
      return <BookOpen className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (typeUpper.includes('QCO')) {
      return <FileText className="w-3.5 h-3.5 text-amber-600" />;
    }
    if (typeUpper.includes('LAB')) {
      return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
    }
    return <Award className="w-3.5 h-3.5 text-emerald-600" />;
  };

  const formatSourceType = (sourceType: string) => {
    const typeUpper = (sourceType || '').toUpperCase();
    if (typeUpper.includes('STANDARD')) return 'Indian Standard';
    if (typeUpper.includes('QCO')) return 'Quality Control Order';
    if (typeUpper.includes('LAB')) return 'Recognized Laboratory';
    if (typeUpper.includes('SCHEME')) return 'Certification Scheme';
    return 'Authoritative BIS Source';
  };

  const displayedSources = isExpanded ? sources : sources.slice(0, 3);
  const hasMore = sources.length > 3;

  return (
    <div className="space-y-2.5 pt-3 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Authoritative Sources & Official Citations ({sources.length})</span>
        </h4>
        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Statutory Evidence
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {displayedSources.map((source, index) => {
          const hasUrl = Boolean(source.url && source.url.startsWith('http'));

          return (
            <div
              key={index}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-left transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="p-1.5 bg-white border border-slate-200 rounded-lg shrink-0 mt-0.5">
                  {getSourceIcon(source.source_type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 break-words">
                      {source.title}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-white text-slate-600 rounded border border-slate-200 shrink-0">
                      {formatSourceType(source.source_type)}
                    </span>
                    {source.is_number && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200 shrink-0">
                        {source.is_number}
                      </span>
                    )}
                  </div>
                  {source.section && (
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      Ref: {source.section}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-center pl-8 sm:pl-0">
                {hasUrl ? (
                  <a
                    href={source.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50/60 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-300 transition-all shadow-2xs"
                  >
                    <span>View Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400 italic px-2 py-0.5 bg-white border border-slate-100 rounded">
                    Official Gazette Record
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 pt-1"
        >
          {isExpanded ? (
            <>
              <span>Show fewer citations</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Show all {sources.length} citations</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
};
