import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningBannerProps {
  warnings: string[];
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-left space-y-1.5 shadow-2xs">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Important Regulatory Notice</span>
      </div>
      <ul className="text-[11px] text-amber-800 space-y-1 pl-5 list-disc">
        {warnings.map((warn, idx) => (
          <li key={idx} className="leading-snug">
            {warn}
          </li>
        ))}
      </ul>
    </div>
  );
};
