import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink
} from 'lucide-react';
import { ComplianceProject, RoadmapStage } from '../../types/compliance';

interface ComplianceRoadmapProps {
  project: ComplianceProject;
  onToggleItem?: (stageId: number, itemId: string) => void;
}

export const ComplianceRoadmap: React.FC<ComplianceRoadmapProps> = ({ project, onToggleItem }) => {
  const navigate = useNavigate();
  const [activeStageId, setActiveStageId] = useState<number>(project.currentStageId || 1);

  const activeStage = project.stages.find((s) => s.id === activeStageId) || project.stages[0];

  return (
    <div className="space-y-6 text-left">
      {/* Progress Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {project.standardCode}
              </span>
              <span className="text-xs text-slate-500 font-medium">Project ID: {project.id}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              {project.productName}
            </h2>
          </div>

          {/* Progress percent meter */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-extrabold text-blue-700 font-mono">
                {project.overallProgress}%
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Compliance Readiness</div>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/80">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${project.overallProgress}%` }}
          />
        </div>

        {/* Horizontal Timeline Bar (Clickable Stages) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {project.stages.map((stage) => {
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.id === activeStageId;
            const isInProgress = stage.status === 'in_progress';

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/50 shadow-2xs ring-1 ring-blue-600'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300'
                    : isInProgress
                    ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    0{stage.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isInProgress ? (
                    <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-slate-800 line-clamp-1 leading-snug">
                  {stage.shortTitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 font-mono uppercase">
                Stage 0{activeStage.id} of 08
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeStage.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : activeStage.status === 'in_progress'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {activeStage.status === 'completed'
                  ? 'Completed'
                  : activeStage.status === 'in_progress'
                  ? 'In Progress'
                  : 'Pending'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {activeStage.name}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {activeStage.description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Est. {activeStage.estimatedDays} Working Days</span>
          </div>
        </div>

        {/* Interactive Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Mandatory Checklist Items & Audit Deliverables</span>
            </h4>
            <span className="text-[11px] text-slate-400">Click checkboxes to toggle demo state</span>
          </div>

          <div className="space-y-2.5">
            {activeStage.checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleItem && onToggleItem(activeStage.id, item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.isCompleted
                    ? 'bg-slate-50/80 border-slate-200'
                    : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => {}} // handled by parent div
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        item.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                  {item.requiredDocument && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 mt-1">
                      <FileText className="w-3 h-3 text-amber-600" />
                      <span>Required Document: {item.requiredDocument}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Link Button for this stage */}
        {activeStage.actionLink && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-700">
              <span className="font-semibold">Next Stage Action: </span>
              <span>Proceed to the dedicated module to resolve requirements.</span>
            </div>
            <button
              onClick={() => navigate(activeStage.actionLink!.route)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] rounded-lg shadow-xs transition-colors"
            >
              <span>{activeStage.actionLink.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
