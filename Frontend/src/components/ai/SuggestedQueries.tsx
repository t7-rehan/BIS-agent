import React from 'react';
import { Lightbulb, ArrowUpRight } from 'lucide-react';

interface SuggestedQueriesProps {
  onSelectQuery: (query: string) => void;
  compact?: boolean;
}

export const SUGGESTED_QUERIES = [
  {
    title: 'LED Emergency Light Requirements',
    query: 'I manufacture LED emergency lights. What BIS requirements apply to me?',
    category: 'Electrical'
  },
  {
    title: 'Pressure Cooker Certification',
    query: 'Is BIS certification mandatory for domestic pressure cookers under IS 2347?',
    category: 'Consumer Goods'
  },
  {
    title: 'Structural Steel Rebar Specs',
    query: 'What standard applies to Fe 500D TMT reinforcement steel bars and what are the testing protocols?',
    category: 'Metallurgy'
  },
  {
    title: 'Two-Wheeler Protective Helmet',
    query: 'What are the safety testing rules for motorcycle helmets under IS 4151?',
    category: 'Automotive'
  },
  {
    title: 'ISI Mark vs CRS Scheme',
    query: 'What is the difference between Scheme-I (ISI Mark) and Scheme-II (CRS)?',
    category: 'Certification'
  },
  {
    title: 'Testing Laboratories Finder',
    query: 'Find BIS-recognized and NABL-accredited test laboratories for electrical safety.',
    category: 'Testing'
  }
];

export const SuggestedQueries: React.FC<SuggestedQueriesProps> = ({ onSelectQuery, compact = false }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
        <span>Suggested BIS Queries</span>
      </div>

      <div className={`grid ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-2.5`}>
        {SUGGESTED_QUERIES.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuery(item.query)}
            className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-subtle text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {item.category}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                {item.title}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-1.5 italic">
              "{item.query}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
