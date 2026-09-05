import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Sparkles,
  BookOpen,
  CheckSquare,
  FlaskConical,
  Grid,
  Shield,
  GraduationCap,
  Bell,
  LayoutDashboard,
  Settings,
  Scale
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/assistant', label: 'AI Assistant', icon: Sparkles, badge: 'AI' },
    { to: '/standards', label: 'Standards', icon: BookOpen },
    { to: '/compliance', label: 'Compliance', icon: CheckSquare },
    { to: '/laboratories', label: 'Laboratories', icon: FlaskConical },
    { to: '/services', label: 'BIS Services', icon: Grid },
    { to: '/consumer', label: 'Consumer Zone', icon: Shield },
    { to: '/knowledge', label: 'Knowledge Hub', icon: GraduationCap },
    { to: '/alerts', label: 'Alerts & QCOs', icon: Bell },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      {/* Top section with national emblem / GovTech context */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 tracking-tight">
              BIS Intelligence
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Conformity & Standards
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#0B192C] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-500/20 text-blue-600">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info & demo disclaimer badge */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="rounded-lg p-2.5 bg-white border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SIH 26107 Prototype</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            India’s Standards, Simplified. Built for SIH demonstration.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-20">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
