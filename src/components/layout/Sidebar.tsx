import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import { cn } from '@lib/utils';
import { useUIStore } from '@store/ui.store';

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  navItems: SidebarNavItem[];
  footerItems?: SidebarNavItem[];
  logo?: ReactNode;
}

export function Sidebar({ navItems, footerItems, logo }: SidebarProps) {
  const isOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <aside
      className={cn(
        'border-sidebar-border bg-sidebar text-sidebar-foreground flex h-full shrink-0 flex-col border-r transition-all duration-200',
        isOpen ? 'w-64' : 'w-16',
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4">{logo}</div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Primary">
        {navItems.map((item) => (
          <SidebarLink key={item.href} item={item} collapsed={!isOpen} />
        ))}
      </nav>

      {footerItems ? (
        <div className="border-sidebar-border space-y-1 border-t px-3 py-3">
          {footerItems.map((item) => (
            <SidebarLink key={item.href} item={item} collapsed={!isOpen} />
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function SidebarLink({ item, collapsed }: { item: SidebarNavItem; collapsed: boolean }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/80',
        )
      }
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </NavLink>
  );
}
