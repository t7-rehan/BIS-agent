import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Scale, Sparkles, ArrowLeft, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { MOCK_STANDARDS } from '../data/standards';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const StandardCompare: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const baseId = searchParams.get('base') || 'IS-10322-5-8';
  const defaultSecondId = baseId === 'IS-10322-5-8' ? 'IS-16102-1' : 'IS-10322-5-8';

  const [standardIdA, setStandardIdA] = useState<string>(baseId);
  const [standardIdB, setStandardIdB] = useState<string>(defaultSecondId);

  const stdA = MOCK_STANDARDS.find((s) => s.id === standardIdA) || MOCK_STANDARDS[0];
  const stdB = MOCK_STANDARDS.find((s) => s.id === standardIdB) || MOCK_STANDARDS[1];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto space-y-6 text-left">
      <DisclaimerBanner variant="subtle" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/standards')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Standards Explorer</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Standard Comparison Matrix
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Side-by-side technical evaluation of scopes, testing protocols, and certification schemes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/assistant?q=Compare ${stdA.code} and ${stdB.code}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] rounded-xl transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Consult AI on Nuances</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Standard A (Primary)
          </label>
          <select
            value={standardIdA}
            onChange={(e) => setStandardIdA(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          >
            {MOCK_STANDARDS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Standard B (Comparison)
          </label>
          <select
            value={standardIdB}
            onChange={(e) => setStandardIdB(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          >
            {MOCK_STANDARDS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Comparison Summary Card */}
      <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/70 rounded-2xl border border-blue-200 p-5 shadow-subtle space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            AI Comparison Summary (Demo Synthesis)
          </h3>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          <strong>{stdA.code}</strong> governs {stdA.title.toLowerCase()} focusing on rigorous emergency autonomous operation and thermal endurance under <strong>{stdA.certificationScheme}</strong>. In contrast, <strong>{stdB.code}</strong> regulates {stdB.title.toLowerCase()} focusing on general product interchangeability under <strong>{stdB.certificationScheme}</strong>. Manufacturers producing complete emergency systems must verify whether their sub-components independently necessitate CRS registration under MeitY schedules.
        </p>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="grid grid-cols-3 bg-slate-100/70 border-b border-slate-200 p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <div>Parameter</div>
          <div className="text-blue-900 font-mono">{stdA.code}</div>
          <div className="text-indigo-900 font-mono">{stdB.code}</div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {/* Title */}
          <div className="grid grid-cols-3 p-4 items-start">
            <span className="font-bold text-slate-700">Official Title</span>
            <span className="font-medium text-slate-900 pr-3">{stdA.title}</span>
            <span className="font-medium text-slate-900">{stdB.title}</span>
          </div>

          {/* Industry & Category */}
          <div className="grid grid-cols-3 p-4 items-start bg-slate-50/50">
            <span className="font-bold text-slate-700">Sector / Category</span>
            <span className="text-slate-700 pr-3">{stdA.industry} ({stdA.category})</span>
            <span className="text-slate-700">{stdB.industry} ({stdB.category})</span>
          </div>

          {/* Scope */}
          <div className="grid grid-cols-3 p-4 items-start">
            <span className="font-bold text-slate-700">Scope</span>
            <p className="text-slate-600 leading-relaxed pr-3">{stdA.scope}</p>
            <p className="text-slate-600 leading-relaxed">{stdB.scope}</p>
          </div>

          {/* Mandatory QCO Status */}
          <div className="grid grid-cols-3 p-4 items-center bg-slate-50/50">
            <span className="font-bold text-slate-700">Mandatory QCO</span>
            <div className="pr-3">
              {stdA.isMandatory ? (
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Mandatory
                </span>
              ) : (
                <span className="text-slate-500">Voluntary</span>
              )}
            </div>
            <div>
              {stdB.isMandatory ? (
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Mandatory
                </span>
              ) : (
                <span className="text-slate-500">Voluntary</span>
              )}
            </div>
          </div>

          {/* Certification Scheme */}
          <div className="grid grid-cols-3 p-4 items-start">
            <span className="font-bold text-slate-700">Licensing Scheme</span>
            <span className="font-semibold text-slate-800 pr-3">{stdA.certificationScheme}</span>
            <span className="font-semibold text-slate-800">{stdB.certificationScheme}</span>
          </div>

          {/* Testing Duration */}
          <div className="grid grid-cols-3 p-4 items-start bg-slate-50/50">
            <span className="font-bold text-slate-700">Testing Lead Time</span>
            <span className="text-slate-800 font-semibold pr-3">~{stdA.laboratoryTestingDaysEst} Days</span>
            <span className="text-slate-800 font-semibold">~{stdB.laboratoryTestingDaysEst} Days</span>
          </div>

          {/* Key Clauses */}
          <div className="grid grid-cols-3 p-4 items-start">
            <span className="font-bold text-slate-700">Core Clauses</span>
            <ul className="space-y-1 text-[11px] text-slate-600 pr-3">
              {stdA.clauses.map((c, i) => (
                <li key={i}>• {c.clauseNumber}: {c.title}</li>
              ))}
            </ul>
            <ul className="space-y-1 text-[11px] text-slate-600">
              {stdB.clauses.map((c, i) => (
                <li key={i}>• {c.clauseNumber}: {c.title}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
