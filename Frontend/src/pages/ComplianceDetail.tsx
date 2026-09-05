import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FlaskConical,
  FileText,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { ComplianceProject } from '../types/compliance';
import { complianceService } from '../services/complianceService';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const ComplianceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ComplianceProject | null>(null);

  useEffect(() => {
    if (id) {
      complianceService.getProjectById(id).then((p) => {
        if (p) setProject(p);
        else complianceService.getProjects().then((all) => setProject(all[0] || null));
      });
    }
  }, [id]);

  if (!project) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading project detail...</div>;
  }

  const completedStages = project.stages.filter((s) => s.status === 'completed');
  const inProgressStages = project.stages.filter((s) => s.status === 'in_progress');
  const pendingStages = project.stages.filter((s) => s.status === 'pending');

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto space-y-6 text-left">
      <DisclaimerBanner variant="subtle" />

      {/* Back button */}
      <button
        onClick={() => navigate('/compliance')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Compliance Projects</span>
      </button>

      {/* Project Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {project.standardCode}
            </span>
            <span className="text-xs text-slate-500 font-medium font-mono">
              App ID: {project.cmlApplicationNumber || 'DRAFT-2026'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {project.productName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Target Certification: Scheme-I (ISI Mark) • Assigned Lab: {project.assignedLab || 'Not yet designated'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xl font-extrabold text-blue-700 font-mono">
              {project.overallProgress}%
            </div>
            <div className="text-xs text-slate-500 font-medium">Readiness Score</div>
          </div>
        </div>
      </div>

      {/* Next Immediate Action Alert Card */}
      <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
              Immediate Next Action Required
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Identify suitable testing laboratory & dispatch pre-test samples
          </h3>
          <p className="text-xs text-slate-600">
            Emergency duration luminous flux tests require a goniophotometer setup at a BIS-recognized NABL testing lab.
          </p>
        </div>

        <button
          onClick={() => navigate('/laboratories')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <FlaskConical className="w-4 h-4" />
          <span>Find Testing Laboratory</span>
        </button>
      </div>

      {/* Three Sections: Completed, In Progress, Next Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completed Stages */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Completed Milestones ({completedStages.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {completedStages.map((stage) => (
              <div key={stage.id} className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900">Stage 0{stage.id}: {stage.shortTitle}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Stages */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                In Progress ({inProgressStages.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {inProgressStages.map((stage) => (
              <div key={stage.id} className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-950">Stage 0{stage.id}: {stage.shortTitle}</span>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-semibold">
                    ~{stage.estimatedDays}d
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {stage.description}
                </p>
                <div className="pt-1 text-[11px] text-slate-500 space-y-1">
                  {stage.checklist.map((c) => (
                    <div key={c.id} className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.isCompleted ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                      <span className={c.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}>{c.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Upcoming Steps ({pendingStages.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {pendingStages.map((stage) => (
              <div key={stage.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 opacity-80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Stage 0{stage.id}: {stage.shortTitle}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Pending</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
