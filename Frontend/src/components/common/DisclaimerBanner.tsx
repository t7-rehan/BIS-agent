import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';

interface DisclaimerBannerProps {
  variant?: 'subtle' | 'compact' | 'full';
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ variant = 'subtle', className = '' }) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-slate-500 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        <span>Demo data — prototype visualization. Official BIS processes remain authoritative.</span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-start gap-3 ${className}`}>
        <ShieldAlert className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-slate-800">
            Official BIS Notice & Responsible AI Disclosure
          </p>
          <p className="text-slate-600 leading-relaxed">
            BIS Sahayak is an AI-powered intelligence platform developed as a prototype visualization for Smart India Hackathon (SIH 26107). All standards, clauses, laboratories, and regulatory timelines shown are for demonstration. Official BIS processes, Gazette notifications, and Scheme manuals remain authoritative. Always verify critical compliance actions with the official Manakonline portal (<a href="https://www.services.bis.gov.in" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">bis.gov.in</a>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-2 px-3 bg-amber-50/90 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-center justify-between gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong className="font-semibold">Demo data — prototype visualization:</strong> AI-generated guidance. Verify important information against official BIS Gazette sources.
        </span>
      </div>
      <span className="shrink-0 px-2 py-0.5 text-[11px] font-semibold bg-amber-200/70 text-amber-900 rounded">
        SIH 26107 Prototype
      </span>
    </div>
  );
};
