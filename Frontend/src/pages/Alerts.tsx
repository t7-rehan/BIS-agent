import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Info,
  Calendar,
  Building2,
  ArrowRight,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { MOCK_ALERTS } from '../data/alerts';
import { AlertSeverity } from '../types/alerts';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');

  const filteredAlerts = selectedSeverity === 'All'
    ? MOCK_ALERTS
    : MOCK_ALERTS.filter((a) => a.severity === selectedSeverity);

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>CRITICAL ENFORCEMENT</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>AMENDMENT DETECTED</span>
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <Info className="w-3 h-3 text-blue-600" />
            <span>REGULATORY NOTICE</span>
          </span>
        );
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 max-w-5xl mx-auto space-y-6 text-left">
      <DisclaimerBanner variant="subtle" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Standards & Compliance Alerts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time feed of Gazette Quality Control Orders (QCOs), standard revisions, and enforcement deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'critical', 'warning', 'info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedSeverity === sev
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {sev.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Highlight Alert: Saved Standard Update Detected */}
      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-subtle space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Saved Standard Update Detected
            </span>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            In Watchlist
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900">
          Amendment No. 2 to IS 10322 (Part 5/Sec 8) : 2013 Enforced
        </h3>

        <p className="text-xs text-slate-700 leading-relaxed">
          An amendment related to your saved standard <strong>IS 10322 (Part 5/Sec 8)</strong> has been detected. High-ambient industrial emergency luminaires (rated up to 50°C) must now undergo mandatory thermal endurance chamber cycling prior to CML renewal.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/standards/IS-10322-5-8')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <span>Review Update Clauses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/assistant?q=Explain Amendment 2 of IS 10322 Part 5 Sec 8')}
            className="text-xs text-amber-900 font-semibold hover:underline"
          >
            Ask AI Impact Analysis
          </button>
        </div>
      </div>

      {/* Alerts Timeline List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-3 text-left"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {getSeverityBadge(alert.severity)}
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {alert.affectedStandardCode}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {alert.industry}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Published: {alert.datePublished}</span>
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {alert.title}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {alert.summary}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Action Required: </span>
                <span className="text-slate-600">{alert.actionRequired}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 shrink-0">
                Ref: {alert.gazetteNotificationRef}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Effective Enforcement Date: <strong>{alert.effectiveDate}</strong>
              </span>

              {alert.affectedStandardId ? (
                <button
                  onClick={() => navigate(`/standards/${alert.affectedStandardId}`)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                >
                  <span>Inspect Standard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/standards')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                >
                  <span>Standards Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
