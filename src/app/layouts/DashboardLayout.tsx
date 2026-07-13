import { LayoutDashboard, MessageSquare, Settings, Sparkles, User } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { Navbar } from '@components/layout/Navbar';
import { Sidebar, type SidebarNavItem } from '@components/layout/Sidebar';
import { appConfig } from '@config/app.config';
import { ROUTES } from '@constants/routes';

const NAV_ITEMS: SidebarNavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'AI Chat', href: ROUTES.AI_CHAT, icon: MessageSquare },
];

const FOOTER_ITEMS: SidebarNavItem[] = [
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
  { label: 'Profile', href: ROUTES.PROFILE, icon: User },
];

export function DashboardLayout() {
  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <Sidebar
        navItems={NAV_ITEMS}
        footerItems={FOOTER_ITEMS}
        logo={
          <span className="text-sidebar-foreground flex items-center gap-2 text-base font-semibold">
            <Sparkles className="text-primary size-5" />
            {appConfig.name}
          </span>
        }
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
