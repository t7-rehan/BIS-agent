import React from 'react';
import { BookOpen, ShieldCheck, FlaskConical, HelpCircle } from 'lucide-react';

interface SuggestedQueriesProps {
  onSelectQuery: (query: string) => void;
  compact?: boolean;
}

export const SUGGESTED_QUERIES = [
  {
    icon: BookOpen,
    color: 'text-blue-600 bg-blue-50',
    label: 'Find a standard',
    query: 'Which Indian Standard applies to pressure cookers?',
  },
  {
    icon: ShieldCheck,
    color: 'text-emerald-600 bg-emerald-50',
    label: 'Check compliance',
    query: 'Is BIS certification mandatory for LED lamps?',
  },
  {
    icon: FlaskConical,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    label: 'Find a laboratory',
    query: 'Which labs can test cement?',
  },
  {
    icon: HelpCircle,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    label: 'BIS services',
    query: 'What services does BIS provide?',
  },
];

export const SuggestedQueries: React.FC<SuggestedQueriesProps> = ({ onSelectQuery, compact = false }) => {
  return (
    <div className={`grid grid-cols-2 ${compact ? '' : 'sm:grid-cols-4'} gap-3`}>
      {SUGGESTED_QUERIES.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.query}
            onClick={() => onSelectQuery(item.query)}
            className="flex flex-col items-start gap-2.5 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-card text-left transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            aria-label={`Ask: ${item.query}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color} shrink-0`}>
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors leading-snug">
                {item.label}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                "{item.query}"
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
