import React from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';
import { Laboratory } from '../../types/laboratories';

interface LabMapVisualizerProps {
  laboratories: Laboratory[];
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export const LabMapVisualizer: React.FC<LabMapVisualizerProps> = ({
  laboratories,
  selectedRegion,
  onSelectRegion
}) => {
  const regions = [
    { name: 'North', label: 'Northern Hub', cities: 'Delhi-NCR, Ghaziabad, Chandigarh' },
    { name: 'West', label: 'Western Hub', cities: 'Mumbai, Pune, Ahmedabad' },
    { name: 'South', label: 'Southern Hub', cities: 'Bengaluru, Chennai, Hyderabad' },
    { name: 'East', label: 'Eastern Hub', cities: 'Kolkata, Bhubaneswar, Patna' },
    { name: 'Central', label: 'Central Hub', cities: 'Bhopal, Nagpur, Raipur' }
  ];

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-elevation relative overflow-hidden text-left">
      {/* Background stylized grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E3E62_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 font-mono">
              National Testing Infrastructure
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            Accredited Laboratory Geographical Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive regional overview of BIS Central, Branch, and NABL-recognized testing centres.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <Compass className="w-4 h-4 text-blue-400" />
          <span>{laboratories.length} Laboratories Empaneled</span>
        </div>
      </div>

      {/* Regional Selector Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5">
        {regions.map((reg) => {
          const count = laboratories.filter((l) => l.region === reg.name).length;
          const isSelected = selectedRegion === reg.name;

          return (
            <button
              key={reg.name}
              onClick={() => onSelectRegion(isSelected ? 'All' : reg.name)}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-blue-600/90 border-blue-400 shadow-lg text-white'
                  : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">{reg.name} Region</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-white text-blue-800' : 'bg-slate-700 text-blue-300'
                  }`}
                >
                  {count} Labs
                </span>
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1">
                {reg.cities}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-blue-300">
                <MapPin className="w-3 h-3" />
                <span>{isSelected ? 'Selected filter' : 'Click to filter'}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative z-10 mt-5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <span>Click any region above to filter active laboratories below.</span>
        <span className="font-mono text-slate-500">Visualization: NABL ISO/IEC 17025 Directory Grid</span>
      </div>
    </div>
  );
};
