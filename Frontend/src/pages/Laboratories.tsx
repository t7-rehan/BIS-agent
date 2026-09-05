import React, { useState, useEffect } from 'react';
import { Search, FlaskConical, MapPin, Filter, Sparkles, Truck, CheckCircle2 } from 'lucide-react';
import { Laboratory } from '../types/laboratories';
import { laboratoryService } from '../services/laboratoryService';
import { LabCard } from '../components/laboratories/LabCard';
import { LabMapVisualizer } from '../components/laboratories/LabMapVisualizer';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const Laboratories: React.FC = () => {
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCapability, setSelectedCapability] = useState('All');
  const [samplePickupOnly, setSamplePickupOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const capabilities = [
    'All',
    'Luminaires & Emergency Lighting',
    'Self-Ballasted LED Lamps',
    'High-Temperature Glow Wire',
    'EMC / EMI Radiated Emissions',
    'Domestic Pressure Cookers',
    'Protective Helmets Impact Drop',
    'High-Strength Deformed Steel Bars',
    'EV Traction Battery Thermal Runaway'
  ];

  const fetchLabs = async () => {
    setLoading(true);
    const data = await laboratoryService.getLaboratories({
      query: searchQuery,
      region: selectedRegion,
      capability: selectedCapability,
      samplePickupOnly
    });
    setLabs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLabs();
  }, [searchQuery, selectedRegion, selectedCapability, samplePickupOnly]);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto space-y-6 text-left">
      <DisclaimerBanner variant="subtle" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Find a Testing Laboratory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search BIS Central, Regional, and NABL-accredited ISO/IEC 17025 test facilities across India.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ● 100% NABL / BIS Recognized
          </span>
        </div>
      </div>

      {/* Map-style visualizer */}
      <LabMapVisualizer
        laboratories={labs}
        selectedRegion={selectedRegion}
        onSelectRegion={(reg) => setSelectedRegion(reg)}
      />

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What testing do you need? (e.g. Emergency luminaire, goniophotometer, hydrostatic proof, helmet drop tower...)"
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedCapability}
              onChange={(e) => setSelectedCapability(e.target.value)}
              className="px-3 py-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium max-w-xs"
            >
              {capabilities.map((cap) => (
                <option key={cap} value={cap}>
                  {cap === 'All' ? 'All Testing Capabilities' : cap}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 px-3 py-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors shrink-0">
              <input
                type="checkbox"
                checked={samplePickupOnly}
                onChange={(e) => setSamplePickupOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span className="font-semibold text-slate-800">Sample Pickup Available</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Found {labs.length} laboratories matching criteria</span>
          {(searchQuery || selectedRegion !== 'All' || selectedCapability !== 'All' || samplePickupOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('All');
                setSelectedCapability('All');
                setSamplePickupOnly(false);
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Lab Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Filtering test facilities...</div>
      ) : labs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <FlaskConical className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No testing laboratories found</h3>
          <p className="text-xs text-slate-500">
            Try loosening filters or searching with a broader product or test parameter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {labs.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      )}
    </div>
  );
};
