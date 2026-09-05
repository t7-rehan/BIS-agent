import React, { useState } from 'react';
import { StandardClause } from '../../types/standards';
import { CheckCircle2, ChevronRight, FileText } from 'lucide-react';

interface ClauseViewerProps {
  clauses: StandardClause[];
  standardCode: string;
}

export const ClauseViewer: React.FC<ClauseViewerProps> = ({ clauses, standardCode }) => {
  const [selectedClause, setSelectedClause] = useState<StandardClause>(clauses[0] || null);

  if (!clauses || clauses.length === 0) {
    return <div className="p-4 text-xs text-slate-500">No clauses loaded for this standard.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-200 rounded-2xl bg-white overflow-hidden text-left">
      {/* Clauses List */}
      <div className="md:col-span-1 border-r border-slate-200 bg-slate-50/50 p-2 space-y-1 max-h-96 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Clauses ({clauses.length})
        </div>
        {clauses.map((clause) => {
          const isSelected = selectedClause?.clauseNumber === clause.clauseNumber;
          return (
            <button
              key={clause.clauseNumber}
              onClick={() => setSelectedClause(clause)}
              className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div>
                <div className={`text-xs ${isSelected ? 'text-white' : 'font-bold text-slate-900'}`}>
                  {clause.clauseNumber}
                </div>
                <div className={`text-[11px] line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {clause.title}
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
            </button>
          );
        })}
      </div>

      {/* Clause Detail Content */}
      <div className="md:col-span-2 p-5 flex flex-col justify-between space-y-4">
        {selectedClause ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
              <span className="font-mono text-sm font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {selectedClause.clauseNumber}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Mandatory Statutory Clause
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900">
              {selectedClause.title}
            </h4>

            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80 font-sans">
              <p className="font-semibold text-slate-800 mb-1">Clause Specification & Test Intent:</p>
              {selectedClause.summary}
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2">
              <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Verification Guideline</p>
                <p className="text-blue-700 text-[11px] mt-0.5">
                  This clause requires verification during factory quality audits and must be logged into the Scheme of Inspection and Testing (SIT) records.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            Select a clause to inspect its regulatory specifications.
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Source: {standardCode}</span>
          <span className="font-mono">BIS Standard Clause Repository</span>
        </div>
      </div>
    </div>
  );
};
