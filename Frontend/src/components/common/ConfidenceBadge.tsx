import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';
import { ConfidenceLevel } from '../../types/ai';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  score?: number;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level, score, size = 'md' }) => {
  const isSm = size === 'sm';

  if (level === 'HIGH') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
          isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        }`}
        title="High Evidence Confidence: Corroborated with active Gazette Orders and published IS clauses"
      >
        <ShieldCheck className={isSm ? 'w-3.5 h-3.5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
        <span>HIGH CONFIDENCE</span>
        {score && <span className="opacity-80 font-mono">({score}%)</span>}
      </span>
    );
  }

  if (level === 'MEDIUM') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${
          isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        }`}
        title="Medium Confidence: Preliminary classification, verify exact HS code or variant"
      >
        <AlertTriangle className={isSm ? 'w-3.5 h-3.5 text-amber-600' : 'w-4 h-4 text-amber-600'} />
        <span>MEDIUM CONFIDENCE</span>
        {score && <span className="opacity-80 font-mono">({score}%)</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      }`}
      title="Insufficient Evidence: General advice only, official Gazette lookup advised"
    >
      <AlertCircle className={isSm ? 'w-3.5 h-3.5 text-rose-600' : 'w-4 h-4 text-rose-600'} />
      <span>INSUFFICIENT EVIDENCE</span>
    </span>
  );
};
