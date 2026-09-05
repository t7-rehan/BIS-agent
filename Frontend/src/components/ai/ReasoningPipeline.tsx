import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, CheckCircle, Search, Layers, Sparkles, ShieldCheck } from 'lucide-react';
import { ReasoningStep } from '../../types/ai';

interface ReasoningPipelineProps {
  steps: ReasoningStep[];
}

export const ReasoningPipeline: React.FC<ReasoningPipelineProps> = ({ steps }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Search className="w-3.5 h-3.5 text-blue-600" />;
      case 1:
        return <Cpu className="w-3.5 h-3.5 text-indigo-600" />;
      case 2:
        return <Layers className="w-3.5 h-3.5 text-cyan-600" />;
      case 3:
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
      case 4:
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 5:
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />;
    }
  };

  if (!steps || steps.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/70 to-slate-100/40 overflow-hidden text-left transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100/70 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-700">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              How was this answer generated?
            </span>
            <span className="ml-2 text-[11px] text-slate-500 font-medium">
              (6-Stage BIS Knowledge Pipeline)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
          <span>{isOpen ? 'Hide Pipeline' : 'Inspect Pipeline'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-slate-200/80 space-y-3">
          <p className="text-xs text-slate-500 mb-2 leading-relaxed">
            BIS Sahayak employs a source-grounded Retrieval-Augmented Generation (RAG) architecture cross-referencing published Bureau of Indian Standards specifications, Central Ministry Quality Control Orders (QCOs), and Scheme of Inspection manuals.
          </p>

          <div className="relative pl-6 space-y-3 border-l-2 border-blue-200 ml-3">
            {steps.map((step, idx) => (
              <div key={step.step} className="relative group">
                {/* Step node dot */}
                <div className="absolute -left-[31px] top-0.5 w-5 h-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs">
                  {getStepIcon(idx)}
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Step {step.step}: {step.name}
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                      Validated
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    {step.description}
                  </p>
                  {step.outputSnippet && (
                    <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      ➜ {step.outputSnippet}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
