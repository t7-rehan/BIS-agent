import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sparkles, BookOpen, CheckSquare, MoreHorizontal } from 'lucide-react';

interface MobileNavProps {
  onOpenMore: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenMore }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center py-1.5 px-3 text-[10px] font-medium transition-colors ${
            isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`
        }
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/assistant"
        className={({ isActive }) =>
          `flex flex-col items-center py-1.5 px-3 text-[10px] font-medium transition-colors ${
            isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`
        }
      >
        <Sparkles className="w-5 h-5 mb-0.5 text-blue-600" />
        <span>BIS AI</span>
      </NavLink>

      <NavLink
        to="/standards"
        className={({ isActive }) =>
          `flex flex-col items-center py-1.5 px-3 text-[10px] font-medium transition-colors ${
            isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`
        }
      >
        <BookOpen className="w-5 h-5 mb-0.5" />
        <span>Standards</span>
      </NavLink>

      <NavLink
        to="/compliance"
        className={({ isActive }) =>
          `flex flex-col items-center py-1.5 px-3 text-[10px] font-medium transition-colors ${
            isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`
        }
      >
        <CheckSquare className="w-5 h-5 mb-0.5" />
        <span>Projects</span>
      </NavLink>

      <button
        onClick={onOpenMore}
        className="flex flex-col items-center py-1.5 px-3 text-[10px] font-medium text-slate-500 hover:text-slate-900"
      >
        <MoreHorizontal className="w-5 h-5 mb-0.5" />
        <span>More</span>
      </button>
    </div>
  );
};
