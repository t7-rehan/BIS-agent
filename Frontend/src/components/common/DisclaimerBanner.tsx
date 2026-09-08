import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';

interface DisclaimerBannerProps {
  variant?: 'subtle' | 'compact' | 'full';
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ variant = 'subtle', className = '' }) => {
  // 'subtle' variant: a single unobtrusive line — no yellow banner, no prototype labels
  if (variant === 'subtle') {
    return (
      <div className={`flex items-center gap-1.5 text-[11px] text-slate-400 ${className}`}>
        <Info className="w-3 h-3 shrink-0" aria-hidden="true" />
        <span>AI-generated guidance. Verify regulatory requirements with official BIS sources.</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-slate-500 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
        <span>AI-generated guidance. Verify with official BIS sources before compliance decisions.</span>
      </div>
    );
  }

  // 'full' variant: detailed legal disclosure (used at page footers)
  return (
    <div className={`p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-3 ${className}`}>
      <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold text-slate-800">Official BIS Disclosure</p>
        <p className="text-slate-500 leading-relaxed">
          BIS Agent is an AI-powered assistant. All answers are grounded in official Indian Standards and BIS regulatory data. Always verify critical compliance decisions against the official{' '}
          <a href="https://www.bis.gov.in" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
            BIS portal
          </a>{' '}
          and Gazette notifications.
        </p>
      </div>
    </div>
  );
};
