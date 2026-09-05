import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  ShieldCheck,
  Cpu,
  Globe,
  Award,
  FileText,
  AlertTriangle,
  FlaskConical,
  Sparkles,
  SearchCheck,
  MessageSquareWarning,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { MOCK_SERVICES } from '../data/services';
import { ServiceCategory } from '../types/services';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const Services: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'ALL'>('ALL');

  const categories: { id: ServiceCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All BIS Services' },
    { id: 'CERTIFICATION', label: 'Certification' },
    { id: 'STANDARDS', label: 'Standards' },
    { id: 'TESTING', label: 'Testing' },
    { id: 'HALLMARKING', label: 'Hallmarking' },
    { id: 'CONSUMERS', label: 'Consumers' }
  ];

  const filteredServices = selectedCategory === 'ALL'
    ? MOCK_SERVICES
    : MOCK_SERVICES.filter((s) => s.category === selectedCategory);

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-indigo-600" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-cyan-600" />;
      case 'Award':
        return <Award className="w-5 h-5 text-purple-600" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'FlaskConical':
        return <FlaskConical className="w-5 h-5 text-teal-600" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'SearchCheck':
        return <SearchCheck className="w-5 h-5 text-blue-700" />;
      case 'MessageSquareWarning':
      default:
        return <MessageSquareWarning className="w-5 h-5 text-rose-600" />;
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto space-y-6 text-left">
      <DisclaimerBanner variant="subtle" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <Grid className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              BIS Services & Schemes Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official conformity schemes, licensing gateways, laboratory empanelment, and consumer protection services.
          </p>
        </div>

        <button
          onClick={() => navigate('/assistant?q=Which BIS service or scheme applies to my factory?')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] rounded-xl transition-all shadow-2xs self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>Help Me Pick a Scheme</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle hover:border-blue-300 hover:shadow-card transition-all flex flex-col justify-between group text-left"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {getServiceIcon(srv.iconName)}
                </div>
                {srv.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {srv.badge}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {srv.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mt-0.5">
                  {srv.title}
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {srv.shortDescription}
              </p>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                <div className="text-slate-500">
                  <span className="font-semibold text-slate-700">Eligibility: </span>
                  {srv.eligibility}
                </div>
                <div className="text-slate-500">
                  <span className="font-semibold text-slate-700">Timeline: </span>
                  {srv.timeline}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                Portal: {srv.portalUrlName}
              </span>
              <button
                onClick={() => {
                  if (srv.category === 'CONSUMERS') navigate('/consumer');
                  else if (srv.category === 'TESTING') navigate('/laboratories');
                  else navigate(`/assistant?q=Tell me more about ${srv.title}`);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
