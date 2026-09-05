import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Bookmark, ShieldAlert, ChevronRight, Scale, Clock } from 'lucide-react';
import { Standard } from '../../types/standards';
import { useApp } from '../../context/AppContext';

interface StandardCardProps {
  standard: Standard;
}

export const StandardCard: React.FC<StandardCardProps> = ({ standard }) => {
  const navigate = useNavigate();
  const { isStandardSaved, toggleSaveStandard } = useApp();
  const saved = isStandardSaved(standard.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle hover:border-blue-300 hover:shadow-card transition-all flex flex-col justify-between text-left group">
      <div>
        {/* Top Badges & Bookmark */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {standard.code}
            </span>
            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {standard.industry}
            </span>
            {standard.isMandatory && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <ShieldAlert className="w-3 h-3" />
                <span>Mandatory QCO</span>
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveStandard(standard.id);
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              saved
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
            title={saved ? 'Saved in Watchlist' : 'Save Standard'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-blue-600' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3
          onClick={() => navigate(`/standards/${standard.id}`)}
          className="text-sm font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors leading-snug line-clamp-2"
        >
          {standard.title}
        </h3>

        {/* Scope snippet */}
        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {standard.scope}
        </p>

        {/* Metadata info */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-slate-400" />
            <span className="line-clamp-1">{standard.certificationScheme}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Est. {standard.laboratoryTestingDaysEst} days test</span>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(`/standards/compare?base=${standard.id}`)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          Compare
        </button>

        <button
          onClick={() => navigate(`/standards/${standard.id}`)}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Clauses</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
