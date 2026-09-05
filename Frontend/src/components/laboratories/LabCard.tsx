import React, { useState } from 'react';
import { FlaskConical, MapPin, ShieldCheck, Clock, Truck, Phone, Mail, ChevronRight, Check } from 'lucide-react';
import { Laboratory } from '../../types/laboratories';

interface LabCardProps {
  lab: Laboratory;
}

export const LabCard: React.FC<LabCardProps> = ({ lab }) => {
  const [requestedQuote, setRequestedQuote] = useState(false);

  const handleRequestQuote = () => {
    setRequestedQuote(true);
    setTimeout(() => setRequestedQuote(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle hover:border-blue-300 hover:shadow-card transition-all flex flex-col justify-between text-left group">
      <div className="space-y-3">
        {/* Header & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {lab.status}
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  NABL: {lab.nablAccreditationNo}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                {lab.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Location & Validity */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{lab.city}, {lab.state}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{lab.bisRecognitionValidity}</span>
          </div>
        </div>

        {/* Turnaround and Sample pickup */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Turnaround: <strong>~{lab.avgTurnaroundDays} days</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            <span>Pickup: <strong>{lab.samplePickupAvailable ? 'Available' : 'Factory dispatch'}</strong></span>
          </div>
        </div>

        {/* Capabilities Pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Testing Capabilities
          </span>
          <div className="flex flex-wrap gap-1.5">
            {lab.capabilities.slice(0, 3).map((cap, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
              >
                {cap}
              </span>
            ))}
            {lab.capabilities.length > 3 && (
              <span className="text-[11px] font-medium text-slate-400 px-1 py-0.5">
                +{lab.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Supported Standards */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Accredited Standards
          </span>
          <div className="text-xs text-blue-800 font-mono flex flex-wrap gap-1">
            {lab.supportedStandards.map((std, idx) => (
              <span key={idx} className="bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 text-[10px]">
                {std}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footers */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <a href={`tel:${lab.phone}`} className="hover:text-blue-600 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Call</span>
          </a>
          <a href={`mailto:${lab.email}`} className="hover:text-blue-600 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Email</span>
          </a>
        </div>

        <button
          onClick={handleRequestQuote}
          className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            requestedQuote
              ? 'bg-emerald-600 text-white'
              : 'bg-[#0B192C] text-white hover:bg-[#1E3E62]'
          }`}
        >
          {requestedQuote ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Inquiry Sent</span>
            </>
          ) : (
            <>
              <span>Book Testing Slot</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
