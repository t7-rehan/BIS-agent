import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Sparkles,
  ArrowRight,
  Plus,
  FolderKanban,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ComplianceProject } from '../types/compliance';
import { complianceService } from '../services/complianceService';
import { ComplianceRoadmap } from '../components/compliance/ComplianceRoadmap';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const Compliance: React.FC = () => {
  const navigate = useNavigate();
  const [productInput, setProductInput] = useState('');
  const [projects, setProjects] = useState<ComplianceProject[]>([]);
  const [activeProject, setActiveProject] = useState<ComplianceProject | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  useEffect(() => {
    complianceService.getProjects().then((data) => {
      setProjects(data);
      if (data.length > 0 && !activeProject) {
        setActiveProject(data[0]); // Default to LED Emergency Light (72%)
      }
    });
  }, []);

  const handleBuildRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInput.trim()) return;

    setIsBuilding(true);
    const newPrj = await complianceService.createProject(productInput.trim());
    setProjects((prev) => [newPrj, ...prev]);
    setActiveProject(newPrj);
    setProductInput('');
    setIsBuilding(false);
  };

  const handleToggleItem = async (stageId: number, itemId: string) => {
    if (!activeProject) return;
    const updated = await complianceService.toggleChecklistItem(activeProject.id, stageId, itemId);
    if (updated) {
      setActiveProject({ ...updated });
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
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
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Compliance Navigator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Turn standards information into an actionable compliance journey from factory readiness to licence grant.
          </p>
        </div>

        <button
          onClick={() => navigate('/assistant?q=How to build a compliance roadmap for my factory?')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] rounded-xl transition-all shadow-2xs self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>Ask AI About Factory Readiness</span>
        </button>
      </div>

      {/* Input Box: "What are you manufacturing?" */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-subtle space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Generate New Compliance Roadmap
        </label>
        <form onSubmit={handleBuildRoadmap} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={productInput}
            onChange={(e) => setProductInput(e.target.value)}
            placeholder="What are you manufacturing? (e.g. LED Emergency Light, Domestic Pressure Cooker, TMT Steel Bar...)"
            className="flex-1 px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isBuilding || !productInput.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>{isBuilding ? 'Analyzing Product...' : 'Build Compliance Roadmap'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 pt-1">
          <span className="font-semibold text-slate-600">Quick Test:</span>
          {['LED Emergency Light', 'Domestic Pressure Cooker', 'Fe 500D TMT Rebar', 'Motorcycle Helmet'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setProductInput(item)}
              className="text-blue-600 hover:underline"
            >
              “{item}”
            </button>
          ))}
        </div>
      </div>

      {/* Projects Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <FolderKanban className="w-3.5 h-3.5" />
          <span>Active Projects:</span>
        </span>
        {projects.map((prj) => {
          const isSelected = activeProject?.id === prj.id;
          return (
            <button
              key={prj.id}
              onClick={() => setActiveProject(prj)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{prj.productName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {prj.overallProgress}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Roadmap View */}
      {activeProject ? (
        <ComplianceRoadmap project={activeProject} onToggleItem={handleToggleItem} />
      ) : (
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading project roadmap...
        </div>
      )}
    </div>
  );
};
