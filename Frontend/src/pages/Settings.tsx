import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Building,
  Globe,
  Bell,
  Bookmark,
  Shield,
  CheckCircle2,
  Save,
  Trash2
} from 'lucide-react';
import { useApp, SupportedLanguage } from '../context/AppContext';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedLanguage,
    setLanguage,
    userRole,
    setUserRole,
    savedStandards,
    toggleSaveStandard
  } = useApp();

  const [orgName, setOrgName] = useState('Apex Luminaire Technologies Pvt. Ltd.');
  const [gstin, setGstin] = useState('07AAAAA0000A1Z5');
  const [msmeStatus, setMsmeStatus] = useState('Small Enterprise (Udyam Verified)');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [qcoAlerts, setQcoAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const languages: { code: SupportedLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' }
  ];

  const roles = [
    'Manufacturer',
    'MSME Unit',
    'Startup Founder',
    'Compliance Engineer',
    'Testing Laboratory',
    'Consumer / Buyer'
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 max-w-4xl mx-auto space-y-6 text-left">
      <DisclaimerBanner variant="subtle" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Platform Settings & Preferences
            </h1>
            <p className="text-xs text-slate-500">
              Manage organization credentials, regulatory role, multilingual interface, and notification preferences.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Preferences Saved</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Language & Regional Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Globe className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Multilingual Language Selector
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {languages.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs">{lang.label}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{lang.native}</div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Stakeholder Role Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Stakeholder Role & Persona
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {roles.map((role) => {
              const isSelected = userRole === role;
              return (
                <button
                  type="button"
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs">{role}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Organization Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Manufacturing Unit & Enterprise Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Entity Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono font-medium"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">MSME Category</label>
              <input
                type="text"
                value={msmeStatus}
                onChange={(e) => setMsmeStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* 4. Notifications & Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Regulatory Alerts & Notifications
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <div>
                <div className="font-bold text-slate-900">Immediate QCO Gazette Alerts</div>
                <div className="text-slate-500">Notify immediately when a new ministry Quality Control Order is published.</div>
              </div>
              <input
                type="checkbox"
                checked={qcoAlerts}
                onChange={(e) => setQcoAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <div>
                <div className="font-bold text-slate-900">Saved Standards Amendment Tracking</div>
                <div className="text-slate-500">Alert when changes or committee drafts are added to bookmarked standards.</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* 5. Saved Standards Watchlist Management */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bookmark className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Saved Standards Watchlist ({savedStandards.length})
            </h3>
          </div>

          <div className="space-y-2">
            {savedStandards.map((stdId) => (
              <div
                key={stdId}
                className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <span className="font-mono font-bold text-blue-900">{stdId.replace(/-/g, ' ')}</span>
                <button
                  type="button"
                  onClick={() => toggleSaveStandard(stdId)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="Remove from saved"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
