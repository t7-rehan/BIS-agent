import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  Share2,
  FileCheck,
  ShieldCheck,
  AlertOctagon,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AIStructuredResponse } from '../../types/ai';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { SourceCard } from './SourceCard';
import { ReasoningPipeline } from './ReasoningPipeline';

interface AIResponseCardProps {
  response: AIStructuredResponse;
  onAskFollowUp?: (query: string) => void;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({ response, onAskFollowUp }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `BIS Sahayak AI Guidance for ${response.productIdentified}\n\nSummary:\n${response.summary}\n\nApplicable Standards:\n${response.applicableStandards.map(s => `- ${s.code}: ${s.title}`).join('\n')}\n\nRegulatory Status:\n${response.regulatoryStatus.isMandatory ? 'MANDATORY' : 'Voluntary'} under ${response.regulatoryStatus.orderName || 'General Directory'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 sm:p-6 space-y-6 text-left transition-all">
      {/* Top Header: Identified Product & Confidence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B192C] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Product Identified
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                {response.productIdentified}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              Conformity Assessment & Technical Guidance
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ConfidenceBadge level={response.confidence} score={response.confidenceScore} />
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="text-slate-800 text-sm leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 font-sans">
        {response.summary}
      </div>

      {/* Applicable Standards Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Potentially Applicable Indian Standards</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            {response.applicableStandards.length} Standard(s) Identified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {response.applicableStandards.map((std) => (
            <div
              key={std.id}
              onClick={() => navigate(`/standards/${std.id}`)}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-subtle cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-blue-800 group-hover:text-blue-900">
                    {std.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {std.matchScore}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug">
                  {std.title}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className={`font-semibold ${std.isMandatory ? 'text-rose-600' : 'text-slate-500'}`}>
                  {std.isMandatory ? '● Mandatory QCO' : '○ Voluntary'}
                </span>
                <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory & Mandatory Status Banner */}
      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2">
        <div className="flex items-center gap-2">
          {response.regulatoryStatus.isMandatory ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <span className="text-xs font-bold text-slate-900">
            Regulatory Notification & Quality Control Order (QCO)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
          <div>
            <span className="text-slate-500 font-medium">Order: </span>
            <span className="font-semibold text-slate-900">{response.regulatoryStatus.orderName || 'General BIS Framework'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Timeline: </span>
            <span className="font-semibold text-slate-900">{response.regulatoryStatus.effectiveDate || 'Active'}</span>
          </div>
          {response.regulatoryStatus.enforcingMinistry && (
            <div className="sm:col-span-2">
              <span className="text-slate-500 font-medium">Enforcing Authority: </span>
              <span className="font-semibold text-slate-900">{response.regulatoryStatus.enforcingMinistry}</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Requirements Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-indigo-600" />
          <span>Clause & Compliance Requirements</span>
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {response.keyRequirements.map((cat, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="text-xs font-bold text-slate-900">{cat.category}</div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {cat.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Testing Protocols */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Mandatory Testing & Laboratory Protocols
        </h4>
        <div className="flex flex-wrap gap-2">
          {response.testingProtocols.map((proto, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
            >
              ✓ {proto}
            </span>
          ))}
        </div>
      </div>

      {/* Actionable Next Steps */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Recommended Actionable Roadmap
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {response.nextActions.map((act) => (
            <div
              key={act.step}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] shrink-0">
                    {act.step}
                  </span>
                  <span>{act.action}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pl-7">
                  {act.description}
                </p>
              </div>

              {act.targetRoute && (
                <div className="mt-3 pl-7">
                  <button
                    onClick={() => navigate(act.targetRoute!)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <span>{act.actionLabel || 'Proceed'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Evidence & Sources Section (Key SIH Differentiator) */}
      {response.sources.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Grounded Evidence & Source Citations ({response.sources.length})</span>
            </h4>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Evidence Mode Active
            </span>
          </div>

          <div className="space-y-2.5">
            {response.sources.map((src) => (
              <SourceCard key={src.id} source={src} />
            ))}
          </div>
        </div>
      )}

      {/* Reasoning Pipeline: "How was this answer generated?" */}
      <ReasoningPipeline steps={response.reasoningPipeline} />

      {/* Bottom Bar: Action buttons & Disclaimer */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/compliance')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <span>Start Compliance Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onAskFollowUp && (
            <button
              onClick={() => onAskFollowUp(`What testing facilities are available for ${response.productIdentified}?`)}
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <span>Ask Follow-up</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-400 italic">
          {response.disclaimer}
        </div>
      </div>
    </div>
  );
};
