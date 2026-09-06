import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface ConfidenceBadgeProps {
  level?: string | null;
  score?: number | string | null;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level, score, size = 'md' }) => {
  const isSm = size === 'sm';
  const normalizedLevel = (level || '').toUpperCase();

  if (normalizedLevel === 'HIGH') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
          isSm ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
        }`}
        title="High Evidence Confidence: Grounded in active Indian Standards, QCOs, or official records"
      >
        <ShieldCheck className={isSm ? 'w-3.5 h-3.5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
        <span>Confidence: High</span>
      </span>
    );
  }

  if (normalizedLevel === 'MEDIUM') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${
          isSm ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
        }`}
        title="Medium Confidence: Standard or product matched; verify exact product classification"
      >
        <AlertTriangle className={isSm ? 'w-3.5 h-3.5 text-amber-600' : 'w-4 h-4 text-amber-600'} />
        <span>Confidence: Medium</span>
      </span>
    );
  }

  if (normalizedLevel === 'LOW') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-orange-50 text-orange-700 border border-orange-200 ${
          isSm ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
        }`}
        title="Low Confidence: Limited corroboration found in knowledge base"
      >
        <Info className={isSm ? 'w-3.5 h-3.5 text-orange-600' : 'w-4 h-4 text-orange-600'} />
        <span>Confidence: Low</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${
        isSm ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
      title="Insufficient Evidence: Official BIS portal verification required"
    >
      <AlertCircle className={isSm ? 'w-3.5 h-3.5 text-rose-600' : 'w-4 h-4 text-rose-600'} />
      <span>Insufficient Evidence</span>
    </span>
  );
};

