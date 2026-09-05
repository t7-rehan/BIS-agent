import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Bell, Globe, User, ChevronDown, CheckCircle2, Shield, Menu } from 'lucide-react';
import { useApp, SupportedLanguage } from '../../context/AppContext';
import { MOCK_ALERTS } from '../../data/alerts';

interface TopbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar }) => {
  const navigate = useNavigate();
  const {
    selectedLanguage,
    setLanguage,
    userRole,
    setIsSearchModalOpen,
    unreadAlertsCount
  } = useApp();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const languages: { code: SupportedLanguage; label: string; nativeName: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'bn', label: 'Bengali', nativeName: 'বাংলা' }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 flex items-center justify-between">
      {/* Left brand & mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#0B192C] flex items-center justify-center text-white shadow-sm group-hover:bg-[#1E3E62] transition-colors">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-lg tracking-tight font-heading">
                BIS Sahayak
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-300 rounded font-mono">
                SIH 26107
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block">
              India’s Standards, Simplified
            </p>
          </div>
        </Link>
      </div>

      {/* Global Search trigger bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search standards, labs, services or guides...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right controls: Demo badge, Language, Alerts, Profile, CTA */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Prototype Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Prototype • Demo Data</span>
        </div>

        {/* Language selector dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsLangMenuOpen(!isLangMenuOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Switch language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="uppercase font-semibold">{selectedLanguage}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-elevation py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Select Language
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors ${
                    selectedLanguage === lang.code ? 'font-semibold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{lang.label} ({lang.nativeName})</span>
                  {selectedLanguage === lang.code && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Alerts Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsLangMenuOpen(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Regulatory Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-elevation py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                  Regulatory Notifications
                </span>
                <Link
                  to="/alerts"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {MOCK_ALERTS.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate('/alerts');
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-900">{alert.affectedStandardCode}</span>
                      <span className="text-slate-400">{alert.datePublished}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {alert.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Role Badge */}
        <Link
          to="/settings"
          className="hidden sm:flex items-center gap-2 pl-2 pr-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          title="User Settings & Profile"
        >
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-[11px]">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">{userRole}</span>
        </Link>

        {/* Primary CTA: Ask BIS AI */}
        <Link
          to="/assistant"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-spin-slow" />
          <span>Ask BIS AI</span>
        </Link>
      </div>
    </header>
  );
};
