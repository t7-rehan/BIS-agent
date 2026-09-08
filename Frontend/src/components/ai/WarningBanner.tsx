import React from 'react';
import { Info } from 'lucide-react';

interface WarningBannerProps {
  warnings: string[];
}

/** Internal/technical messages that should never be shown to the user. */
const SUPPRESSED_PATTERNS = [
  'LLM generation warning',
  'Operating in offline',
  'Regulatory Disclaimer: Information is grounded',
  'UNKNOWN_QUERY',
  'INSUFFICIENT_EVIDENCE',
  'Internal Server Error',
  'HTTP 500',
  'HTTP 422',
];

function isUserFacing(warn: string): boolean {
  return !SUPPRESSED_PATTERNS.some((p) => warn.toLowerCase().includes(p.toLowerCase()));
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  const visible = warnings.filter(isUserFacing);
  if (visible.length === 0) return null;

  return (
    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
      <ul className="text-[11px] text-amber-800 space-y-1">
        {visible.map((warn, idx) => (
          <li key={idx} className="leading-snug">{warn}</li>
        ))}
      </ul>
    </div>
  );
};
