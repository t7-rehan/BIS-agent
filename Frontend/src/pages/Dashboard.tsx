import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Bookmark,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FlaskConical,
  FileCheck
} from 'lucide-react';
import { INITIAL_COMPLIANCE_PROJECTS } from '../data/compliance';
import { MOCK_ALERTS } from '../data/alerts';
import { useApp } from '../context/AppContext';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, savedStandards } = useApp();

  const activeProjects = INITIAL_COMPLIANCE_PROJECTS;

  const statsCards = [
    { title: 'Active Projects', value: '3', label: 'Certification in progress', icon: CheckSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Pending Actions', value: '4', label: 'Lab samples & SIT checks', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Saved Standards', value: savedStandards.length.toString(), label: 'Watchlist tracking', icon: Bookmark, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Regulatory Alerts', value: '2', label: 'Recent QCO amendments', icon: Bell, color: 'text-rose-600', bg: 'bg-rose-50' }
  ];

  const recentAiQueries = [
    { title: 'LED Emergency Light Requirements', date: 'Today, 10:14 AM', target: '/assistant?q=LED emergency lights' },
    { title: 'Hydrostatic pressure test parameters for IS 2347', date: 'Yesterday', target: '/assistant?q=pressure cooker hydrostatic test' },
    { title: 'Steel rebar chemical ladle limits under IS 1786', date: 'Sep 2', target: '/assistant?q=IS 1786 chemical composition' }
  ];

  const upcomingActions = [
    { title: 'Identify NABL Test Lab for Emergency Luminaire', deadline: 'Due in 3 days', project: 'LED Emergency Light', route: '/laboratories' },
    { title: 'Upload Calibration Records for Factory UTM & Gauges', deadline: 'Due in 5 days', project: 'Steel TMT Bar', route: '/compliance' },
    { title: 'Verify Gasket Leaching Test Report with Laboratory', deadline: 'Due in 7 days', project: 'Pressure Cooker', route: '/laboratories' }
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto space-y-6 text-left">
      <DisclaimerBanner variant="subtle" />

      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manufacturing Compliance Overview • Role: <strong className="text-slate-800">{userRole}</strong> • Standards Watch Active
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/assistant')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B192C] hover:bg-[#1E3E62] rounded-xl transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Consult BIS AI</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {stat.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Compliance Projects Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Compliance Projects
            </h3>
            <p className="text-xs text-slate-500">
              Live progress meters towards Grant of BIS Licence (Scheme-I / Scheme-II)
            </p>
          </div>
          <button
            onClick={() => navigate('/compliance')}
            className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            <span>View Navigator</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeProjects.map((prj) => (
            <div
              key={prj.id}
              onClick={() => navigate(`/compliance/${prj.id}`)}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-subtle cursor-pointer transition-all space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    {prj.standardCode.split(':')[0]}
                  </span>
                  <span className="text-sm font-extrabold font-mono text-blue-700">
                    {prj.overallProgress}%
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {prj.productName}
                </h4>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${prj.overallProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Updated: {prj.lastUpdated}</span>
                <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                  <span>Track</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Upcoming Actions & Recent AI Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Regulatory & Factory Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Pending Compliance Actions
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">3 Outstanding</span>
          </div>

          <div className="space-y-2.5">
            {upcomingActions.map((act, idx) => (
              <div
                key={idx}
                onClick={() => navigate(act.route)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-semibold text-blue-700">{act.project}</span>
                    <span>•</span>
                    <span className="text-amber-700 font-medium">{act.deadline}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent AI Queries & Regulatory Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent AI Consultations
            </h3>
            <button
              onClick={() => navigate('/assistant')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Open Assistant
            </button>
          </div>

          <div className="space-y-2.5">
            {recentAiQueries.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(item.target)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">{item.title}</h4>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
