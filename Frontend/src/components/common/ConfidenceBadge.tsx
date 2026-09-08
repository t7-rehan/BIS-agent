import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface ConfidenceBadgeProps {
  level?: string | null;
  score?: number | string | null;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level, score: _score, size = 'md' }) => {
  const normalizedLevel = (level || '').toUpperCase();
  const isSm = size === 'sm';

  const base = `inline-flex items-center gap-1 font-medium rounded-full ${
    isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
  }`;

  if (normalizedLevel === 'HIGH') {
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-200`}
        title="High confidence: grounded in active Indian Standards and official BIS records"
      >
        <ShieldCheck className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        <span>Confidence: High</span>
      </span>
    );
  }

  if (normalizedLevel === 'MEDIUM') {
    return (
      <span
        className={`${base} bg-amber-50 text-amber-700 border border-amber-200`}
        title="Medium confidence: standard or product matched; verify exact classification"
      >
        <AlertTriangle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        <span>Confidence: Medium</span>
      </span>
    );
  }

  if (normalizedLevel === 'LOW') {
    return (
      <span
        className={`${base} bg-orange-50 text-orange-700 border border-orange-200`}
        title="Low confidence: limited corroboration found"
      >
        <Info className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        <span>Confidence: Low</span>
      </span>
    );
  }

  // INSUFFICIENT_EVIDENCE or anything else — don't show a fake confidence
  if (!normalizedLevel || normalizedLevel === 'INSUFFICIENT_EVIDENCE' || normalizedLevel === 'INSUFFICIENT') {
    return (
      <span
        className={`${base} bg-slate-50 text-slate-500 border border-slate-200`}
        title="Insufficient evidence: verify directly on the official BIS portal"
      >
        <AlertCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        <span>Insufficient Evidence</span>
      </span>
    );
  }

  return null;
};
