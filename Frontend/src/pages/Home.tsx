import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  ShieldAlert,
  Search,
  Check,
  X,
  Scale,
  Zap,
  Building2,
  Users,
  Award,
  Layers,
  FileText
} from 'lucide-react';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [heroPrompt, setHeroPrompt] = useState('');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = heroPrompt.trim() || 'I manufacture LED emergency lights. What BIS requirements apply to me?';
    navigate(`/assistant?q=${encodeURIComponent(query)}`);
  };

  const handleQuickQuery = (query: string) => {
    navigate(`/assistant?q=${encodeURIComponent(query)}`);
  };

  const coreFeatures = [
    {
      icon: Sparkles,
      title: 'AI Standards Assistant',
      description: 'Interact with a domain-tuned intelligence engine that parses complex product specs into plain Indian Standard obligations.',
      link: '/assistant',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: BookOpen,
      title: 'Smart Standard Discovery',
      description: 'Explore over 21,000 active Indian Standards with cross-indexed HS codes, sectional committees, and mandatory QCO flags.',
      link: '/standards',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      icon: ShieldCheck,
      title: 'Evidence-backed Answers',
      description: 'Every answer is grounded with verbatim clause numbers, Gazette notification dates, and confidence scoring — no hallucinations.',
      link: '/assistant',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      icon: CheckCircle2,
      title: 'Compliance Navigator',
      description: 'Automate an 8-stage compliance journey from factory test setup to Manakonline portal submission and CML licence grant.',
      link: '/compliance',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50'
    },
    {
      icon: FlaskConical,
      title: 'Laboratory Finder',
      description: 'Locate BIS-recognized & NABL-accredited test laboratories by testing capability, city, turnaround time, and sample pickup.',
      link: '/laboratories',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: ShieldAlert,
      title: 'Consumer Assistance',
      description: 'Verify 7-digit CML licence numbers, check Gold Hallmark HUIDs, and report substandard or misleading ISI marks in seconds.',
      link: '/consumer',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <div className="space-y-16 py-6 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto text-left">
      {/* Disclaimer Banner */}
      <DisclaimerBanner variant="subtle" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 text-center max-w-4xl mx-auto space-y-6">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>AI-Powered BIS Intelligence Platform • SIH 26107</span>
        </div>

        {/* Headline & Taglines */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            India’s Standards, <span className="text-blue-600">Simplified.</span>
          </h1>
          <p className="text-sm sm:text-base font-semibold text-slate-500 uppercase tracking-widest">
            Ask. Discover. Verify. Comply.
          </p>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Understand Indian Standards, certification requirements and BIS services through an intelligent, source-backed assistant designed for manufacturers, MSMEs, engineers, and consumers.
          </p>
        </div>

        {/* Large AI Search Box */}
        <div className="pt-2 max-w-2xl mx-auto">
          <form
            onSubmit={handleHeroSubmit}
            className="bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 focus-within:border-blue-600 shadow-elevation transition-all flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-2.5 flex-1 px-3 w-full">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                placeholder="Ask about a product, standard, certification or BIS service…"
                className="w-full text-sm sm:text-base text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none py-1.5"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#0B192C] hover:bg-[#1E3E62] rounded-xl shadow-md transition-all active:scale-[0.98] shrink-0"
            >
              <span>Ask BIS AI</span>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>
          </form>

          {/* Example prompt hint */}
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <span className="font-semibold text-slate-600">Example:</span>
            <button
              onClick={() => handleQuickQuery('I manufacture LED emergency lights. What BIS requirements apply to me?')}
              className="text-blue-600 hover:underline text-left italic font-medium"
            >
              “I manufacture LED emergency lights. What BIS requirements apply to me?”
            </button>
          </div>
        </div>

        {/* Suggested Queries Pills */}
        <div className="pt-2">
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-medium">Quick Queries:</span>
            {[
              { label: 'Find applicable standard', q: 'Find applicable Indian Standard for domestic pressure cookers' },
              { label: 'Is BIS certification mandatory?', q: 'Is BIS certification mandatory for structural steel rebars?' },
              { label: 'Find testing laboratory', q: 'Find accredited testing laboratory for electrical luminaires' },
              { label: 'Explain an IS standard', q: 'Explain clauses and test requirements of IS 10322 Part 5 Sec 8' },
              { label: 'Verify BIS information', q: 'How to verify BIS CML licence number and Gold Hallmark HUID?' }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuery(item.q)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 font-medium transition-all shadow-2xs"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. PROBLEM / SOLUTION SECTION (VISUAL COMPARISON) */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            The Transformation: From Chaos to Clarity
          </h2>
          <p className="text-sm text-slate-600">
            How BIS Sahayak re-architects the compliance workflow for Indian manufacturers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* BEFORE CARD */}
          <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <X className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  The Old Way (Fragmented)
                </span>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                High Friction & Delay
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              {[
                'Multiple disparate portals (Manakonline, Gazette, CRS, NABL)',
                'Hundreds of complex technical PDFs with unclear applicability',
                'Unstructured standards text and obscure amendment sheets',
                'Manual cross-checking of Quality Control Orders across ministries',
                'Uncertainty regarding accredited lab capabilities and turnaround',
                'Result: Costly delays, rejected shipments, and compliance confusion'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Multiple Portals ➜ PDFs ➜ Amendments ➜ Confusion
            </div>
          </div>

          {/* AFTER CARD */}
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-subtle space-y-4 ring-1 ring-emerald-500/20">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  With BIS Sahayak (Unified)
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Instant & Source-Backed
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              {[
                'Ask in natural language — instant product and HS code identification',
                'Understand mandatory vs voluntary status under active Gazette QCOs',
                'Retrieve grounded clauses, test parameters, and equipment checklists',
                'Verify evidence with transparent citations and confidence indicators',
                'Act with an automated 8-stage compliance roadmap and lab finder',
                'Result: 60% faster compliance readiness with zero guesswork'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-mono font-semibold">
              Ask ➜ Understand ➜ Retrieve ➜ Verify ➜ Act
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES GRID */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Intelligent Compliance Infrastructure
          </h2>
          <p className="text-sm text-slate-600">
            Comprehensive modules designed for industry scale and consumer protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(feat.link)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle hover:border-blue-300 hover:shadow-card cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-xl ${feat.bg} ${feat.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>Explore Module</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. KEY DIFFERENTIATOR: AI + BIS KNOWLEDGE + EVIDENCE + ACTION */}
      <section className="bg-gradient-to-br from-[#0B192C] to-[#1E3E62] text-white rounded-3xl p-6 sm:p-10 shadow-elevation relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Award className="w-3.5 h-3.5" />
            <span>Why BIS Sahayak Stands Apart</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Not Just a Chatbot. A Governed Intelligence Engine.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Generic LLMs hallucinate non-existent standard clauses or cite outdated 1980s specifications. BIS Sahayak enforces a deterministic 6-stage RAG pipeline that binds every answer directly to official Gazette Quality Control Orders, testing manuals, and sectional committee standards.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
              <div className="text-xl font-bold font-mono text-blue-300">100%</div>
              <div className="text-[11px] text-slate-300">Evidence Grounded</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
              <div className="text-xl font-bold font-mono text-emerald-300">21,000+</div>
              <div className="text-[11px] text-slate-300">Active IS Standards</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
              <div className="text-xl font-bold font-mono text-cyan-300">8-Stage</div>
              <div className="text-[11px] text-slate-300">Roadmap Navigator</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
              <div className="text-xl font-bold font-mono text-amber-300">NABL</div>
              <div className="text-[11px] text-slate-300">Lab Integration</div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={() => navigate('/assistant')}
              className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Test the AI Assistant →
            </button>
            <button
              onClick={() => navigate('/compliance')}
              className="px-5 py-2.5 bg-white/15 text-white hover:bg-white/25 rounded-xl text-xs font-bold border border-white/20 transition-all"
            >
              View Compliance Flow
            </button>
          </div>
        </div>
      </section>

      {/* 5. USER SEGMENTS / AUDIENCE BANNER */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            Tailored For Every Stakeholder in India’s Quality Ecosystem
          </h3>
          <p className="text-xs text-slate-500">
            From large manufacturers to MSMEs and informed consumers.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          {[
            { label: 'Manufacturers', desc: 'Scheme-I & SIT setup', icon: Building2 },
            { label: 'MSMEs', desc: '50% fee rebates & support', icon: Scale },
            { label: 'Startups', desc: 'Fast-track certification', icon: Zap },
            { label: 'Engineers', desc: 'Clause & test standards', icon: Layers },
            { label: 'Researchers', desc: 'Standard formulation', icon: FileText },
            { label: 'Consumers', desc: 'HUID & CML verification', icon: Users }
          ].map((seg, idx) => {
            const Icon = seg.icon;
            return (
              <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-1.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">{seg.label}</div>
                <div className="text-[10px] text-slate-500">{seg.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full Disclaimer */}
      <DisclaimerBanner variant="full" />
    </div>
  );
};
