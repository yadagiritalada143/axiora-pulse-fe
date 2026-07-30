import { LayoutGrid, ListChecks, Users } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { ROUTES } from '@constants/routes';
import { MentorShell, type MentorNavItem } from '@features/ideaValidation/components';

const ADMIN_OVERVIEW_ITEM: MentorNavItem = {
  label: 'Overview',
  icon: LayoutGrid,
  href: ROUTES.ADMIN_DASHBOARD,
  end: true,
};

const ADMIN_NAV_ITEMS: MentorNavItem[] = [
  { label: 'Interactive Questions', icon: ListChecks, href: ROUTES.ADMIN_INTERACTIVE_QUESTIONS },
  { label: 'Users', icon: Users, href: ROUTES.ADMIN_USERS },
];

export function AdminDashboardLayout() {
  return (
    <MentorShell
      overviewItem={ADMIN_OVERVIEW_ITEM}
      navItems={ADMIN_NAV_ITEMS}
      navSectionLabel="Admin"
    >
      <Outlet />
    </MentorShell>
  );
}
