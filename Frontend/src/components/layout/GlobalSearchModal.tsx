import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, Grid, GraduationCap, FlaskConical, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_STANDARDS } from '../../data/standards';
import { MOCK_SERVICES } from '../../data/services';
import { MOCK_KNOWLEDGE_ARTICLES } from '../../data/knowledge';
import { MOCK_LABORATORIES } from '../../data/laboratories';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchModalOpen, setIsSearchModalOpen } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+K / Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(!isSearchModalOpen);
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const query = searchTerm.toLowerCase().trim();

  const matchedStandards = query
    ? MOCK_STANDARDS.filter(
        (s) =>
          s.code.toLowerCase().includes(query) ||
          s.title.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      ).slice(0, 3)
    : MOCK_STANDARDS.slice(0, 2);

  const matchedServices = query
    ? MOCK_SERVICES.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.shortDescription.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      ).slice(0, 3)
    : MOCK_SERVICES.slice(0, 2);

  const matchedKnowledge = query
    ? MOCK_KNOWLEDGE_ARTICLES.filter(
        (k) =>
          k.title.toLowerCase().includes(query) ||
          k.description.toLowerCase().includes(query) ||
          k.tags.some((t) => t.toLowerCase().includes(query))
      ).slice(0, 3)
    : MOCK_KNOWLEDGE_ARTICLES.slice(0, 2);

  const matchedLabs = query
    ? MOCK_LABORATORIES.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.city.toLowerCase().includes(query) ||
          l.capabilities.some((c) => c.toLowerCase().includes(query))
      ).slice(0, 3)
    : MOCK_LABORATORIES.slice(0, 2);

  const handleSelect = (url: string) => {
    setIsSearchModalOpen(false);
    setSearchTerm('');
    navigate(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center items-start">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSearchModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search standards (e.g. IS 10322), labs, services, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center ml-2 px-2 py-0.5 text-xs text-slate-400 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Categorized Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 divide-y divide-slate-100">
          {/* Standards */}
          {matchedStandards.length > 0 && (
            <div className="pt-2 first:pt-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Indian Standards</span>
              </div>
              <div className="space-y-1">
                {matchedStandards.map((std) => (
                  <button
                    key={std.id}
                    onClick={() => handleSelect(`/standards/${std.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {std.code}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {std.title}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BIS Services */}
          {matchedServices.length > 0 && (
            <div className="pt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Grid className="w-3.5 h-3.5" />
                <span>BIS Services & Schemes</span>
              </div>
              <div className="space-y-1">
                {matchedServices.map((srv) => (
                  <button
                    key={srv.id}
                    onClick={() => handleSelect('/services')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {srv.title}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {srv.shortDescription}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Laboratories */}
          {matchedLabs.length > 0 && (
            <div className="pt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Testing Laboratories</span>
              </div>
              <div className="space-y-1">
                {matchedLabs.map((lab) => (
                  <button
                    key={lab.id}
                    onClick={() => handleSelect('/laboratories')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {lab.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {lab.city}, {lab.state} • NABL: {lab.nablAccreditationNo}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Articles */}
          {matchedKnowledge.length > 0 && (
            <div className="pt-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Knowledge & Compliance Guides</span>
              </div>
              <div className="space-y-1">
                {matchedKnowledge.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => handleSelect('/knowledge')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {art.title}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {art.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Search across standards, QCO orders, labs & schemes</span>
          <span className="font-medium text-slate-600">Demo Search Index</span>
        </div>
      </div>
    </div>
  );
};
