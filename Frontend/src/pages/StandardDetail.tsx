import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Bookmark,
  Scale,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText,
  FlaskConical,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { Standard } from '../types/standards';
import { standardsService } from '../services/standardsService';
import { ClauseViewer } from '../components/standards/ClauseViewer';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { useApp } from '../context/AppContext';

export const StandardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStandardSaved, toggleSaveStandard } = useApp();

  const [standard, setStandard] = useState<Standard | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'clauses' | 'testing' | 'certification' | 'amendments'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      standardsService.getStandardById(id).then((res) => {
        setStandard(res || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading standard details...</div>;
  }

  if (!standard) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-800">Standard Not Found</h2>
        <button
          onClick={() => navigate('/standards')}
          className="text-xs text-blue-600 font-semibold hover:underline"
        >
          Return to Standards Explorer
        </button>
      </div>
    );
  }

  const saved = isStandardSaved(standard.id);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto space-y-6 text-left">
      <DisclaimerBanner variant="subtle" />

      {/* Back button */}
      <button
        onClick={() => navigate('/standards')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Standards Directory</span>
      </button>

      {/* Standard Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              {standard.code}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {standard.industry}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Status: {standard.status}
            </span>
            {standard.isMandatory && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Mandatory QCO Enforced</span>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {standard.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {standard.scope}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-500">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
              <span className="font-semibold text-slate-800">{standard.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheme</span>
              <span className="font-semibold text-slate-800">{standard.certificationScheme}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Publication Year</span>
              <span className="font-semibold text-slate-800">{standard.year}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Testing Est.</span>
              <span className="font-semibold text-slate-800">~{standard.laboratoryTestingDaysEst} Working Days</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Bookmark */}
        <div className="flex flex-row lg:flex-col items-center gap-2.5 shrink-0 self-start">
          <button
            onClick={() => toggleSaveStandard(standard.id)}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              saved
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-blue-700' : ''}`} />
            <span>{saved ? 'Saved in Watchlist' : 'Save Standard'}</span>
          </button>

          <button
            onClick={() => navigate(`/standards/compare?base=${standard.id}`)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all"
          >
            <Scale className="w-4 h-4 text-slate-500" />
            <span>Compare</span>
          </button>

          <button
            onClick={() => navigate(`/assistant?q=Explain Indian Standard ${standard.code}`)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0B192C] hover:bg-[#1E3E62] rounded-xl shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>Ask AI About This</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-0.5">
        {[
          { id: 'overview', label: 'Overview & Scope' },
          { id: 'clauses', label: `Clauses (${standard.clauses.length})` },
          { id: 'testing', label: `Testing & Methods (${standard.testingRequirements.length})` },
          { id: 'certification', label: 'Certification & QCO' },
          { id: 'amendments', label: `Amendments (${standard.amendments.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Scope & Application
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {standard.scope}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Core Engineering & Safety Requirements
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {standard.keyRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Cross-Referenced Indian Standards
                </h3>
                <div className="space-y-2">
                  {standard.relatedStandards.map((rel, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-900">{rel.code}</span>
                      <span className="text-slate-600">{rel.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clauses' && (
            <div className="space-y-3">
              <ClauseViewer clauses={standard.clauses} standardCode={standard.code} />
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Laboratory Test Methods & Sampling Frequencies
              </h3>

              <div className="space-y-3">
                {standard.testingRequirements.map((test, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{test.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {test.frequency}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="font-medium text-slate-500">Method Standard: </span>
                      <span className="font-mono font-semibold text-slate-800">{test.methodStandard}</span>
                    </div>
                    <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-800">Critical Threshold: </span>
                      {test.criticalParameters}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/laboratories')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Find Labs Accredited for {standard.code}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'certification' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Statutory Quality Control Order (QCO)
                </h3>
                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-rose-900">
                      Compulsory Compliance Notification
                    </span>
                  </div>
                  <p className="text-xs text-rose-950 font-medium leading-relaxed">
                    {standard.qcoReference}
                  </p>
                  <div className="text-xs text-rose-800">
                    Mandatory Enforcement Date: <strong>{standard.qcoEffectiveDate}</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Applicable Certification Scheme
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Manufacture of this product requires registration under <strong>{standard.certificationScheme}</strong>. Under this scheme, the manufacturer must maintain factory testing facilities adhering to the Scheme of Inspection and Testing (SIT) and obtain an official CML licence before affixing the BIS mark.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/compliance')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] rounded-xl transition-colors"
                >
                  <span>Build Compliance Roadmap for This Standard</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'amendments' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Active Gazette Amendments
              </h3>

              <div className="space-y-3">
                {standard.amendments.map((am, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{am.amendmentNumber}</span>
                      <span className="text-xs text-slate-500 font-medium">{am.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {am.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right AI & Quick Actions Sidepanel (1 col) */}
        <div className="space-y-5">
          {/* Ask AI Consultation Box */}
          <div className="bg-gradient-to-b from-blue-50/80 to-white rounded-2xl border border-blue-200 p-5 shadow-subtle space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Ask AI About This Standard</h4>
                <p className="text-[11px] text-slate-500">Grounded in {standard.code}</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                `Is ${standard.code} mandatory for exports?`,
                `What in-house test equipment is needed for ${standard.code}?`,
                `Are MSMEs exempt under ${standard.code}?`
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/assistant?q=${encodeURIComponent(query)}`)}
                  className="w-full p-2.5 text-xs text-left bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-slate-700 font-medium flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{query}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Standard Metadata
            </h4>
            <div className="space-y-2 text-xs text-slate-600 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-1">
                <span>Total Clauses</span>
                <span className="font-bold text-slate-900">{standard.clauses.length}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Testing Lead Time</span>
                <span className="font-bold text-slate-900">~{standard.laboratoryTestingDaysEst} days</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>QCO Status</span>
                <span className="font-bold text-rose-600">Mandatory</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Accredited Labs</span>
                <button onClick={() => navigate('/laboratories')} className="text-blue-600 font-bold hover:underline">
                  View Empaneled
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
