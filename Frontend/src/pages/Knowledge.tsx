import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Clock, Sparkles, BookOpen, ChevronRight, Tag, ArrowRight } from 'lucide-react';
import { MOCK_KNOWLEDGE_ARTICLES } from '../data/knowledge';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const Knowledge: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  const categories = [
    'All',
    'Understanding BIS',
    'Indian Standards',
    'Certification',
    'Testing',
    'Hallmarking',
    'Compliance Basics'
  ];

  const filteredArticles = selectedCategory === 'All'
    ? MOCK_KNOWLEDGE_ARTICLES
    : MOCK_KNOWLEDGE_ARTICLES.filter((a) => a.category === selectedCategory);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto space-y-6 text-left">
      <DisclaimerBanner variant="subtle" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Knowledge & Compliance Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authoritative explainers on Quality Control Orders (QCOs), licensing paths, lab testing, and subsidies.
          </p>
        </div>

        <button
          onClick={() => navigate('/assistant?q=Explain Indian Standards compliance for first-time startups')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] rounded-xl transition-all shadow-2xs self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>Ask AI Regulatory Questions</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((art) => {
          const isExpanded = expandedArticleId === art.id;

          return (
            <div
              key={art.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:border-blue-300 hover:shadow-card transition-all flex flex-col justify-between text-left space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{art.readTime}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {art.description}
                </p>

                {/* Key Takeaways */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Key Highlights
                  </span>
                  {art.keyTakeaways.map((takeaway, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>

                {/* Expanded Sections */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                    {art.contentSections.map((sec, sIdx) => (
                      <div key={sIdx} className="space-y-1">
                        <h4 className="font-bold text-slate-900">{sec.heading}</h4>
                        <p className="text-slate-600 leading-relaxed">{sec.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setExpandedArticleId(isExpanded ? null : art.id)}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  {isExpanded ? 'Collapse Guide' : 'Read Full Guide'}
                </button>

                <button
                  onClick={() => navigate(`/assistant?q=Explain ${encodeURIComponent(art.title)}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI about this</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
