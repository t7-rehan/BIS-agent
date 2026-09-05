import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, ShieldAlert, Sparkles, Scale, RefreshCw } from 'lucide-react';
import { Standard } from '../types/standards';
import { standardsService } from '../services/standardsService';
import { StandardCard } from '../components/standards/StandardCard';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const Standards: React.FC = () => {
  const navigate = useNavigate();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [mandatoryOnly, setMandatoryOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const industries = [
    'All',
    'Electrical & Electronics',
    'Mechanical',
    'Civil & Metallurgy',
    'Automotive',
    'Consumer Goods'
  ];

  const fetchStandards = async () => {
    setLoading(true);
    const data = await standardsService.getStandards({
      query: searchQuery,
      industry: selectedIndustry,
      status: selectedStatus,
      isMandatoryOnly: mandatoryOnly
    });
    setStandards(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStandards();
  }, [searchQuery, selectedIndustry, selectedStatus, mandatoryOnly]);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto space-y-6 text-left">
      <DisclaimerBanner variant="subtle" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Explore Indian Standards
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search active Indian Standards (IS), mandatory QCOs, testing schedules, and clause specifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/standards/compare')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
          >
            <Scale className="w-3.5 h-3.5 text-slate-500" />
            <span>Compare Standards</span>
          </button>

          <button
            onClick={() => navigate('/assistant?q=Find applicable standard for my product')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] rounded-xl transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Discover via AI</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by IS number (e.g. IS 10322), product, industry or keyword…"
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === 'All' ? 'All Industries' : ind}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 px-3 py-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors shrink-0">
              <input
                type="checkbox"
                checked={mandatoryOnly}
                onChange={(e) => setMandatoryOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span className="font-semibold text-rose-700">Mandatory QCO Only</span>
            </label>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Showing {standards.length} Indian Standards</span>
            <span className="font-mono text-[11px] text-slate-400">(Demo data — prototype visualization)</span>
          </div>
          {(searchQuery || selectedIndustry !== 'All' || mandatoryOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('All');
                setMandatoryOnly(false);
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Standards Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading standards directory...</span>
        </div>
      ) : standards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching Indian Standards found</h3>
          <p className="text-xs text-slate-500">
            Try searching with a broader product keyword or ask our AI assistant to recommend applicable standards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {standards.map((std) => (
            <StandardCard key={std.id} standard={std} />
          ))}
        </div>
      )}
    </div>
  );
};
