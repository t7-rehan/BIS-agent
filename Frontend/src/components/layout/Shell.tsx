import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { GlobalSearchModal } from './GlobalSearchModal';

export const Shell: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Bar */}
      <Topbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex w-full">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 pb-20 lg:pb-8 flex flex-col">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenMore={() => setIsMobileSidebarOpen(true)} />

      {/* Global Quick Search Modal (Ctrl+K) */}
      <GlobalSearchModal />
    </div>
  );
};
