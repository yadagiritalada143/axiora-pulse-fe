import { Outlet } from 'react-router-dom';

import { MentorShell } from '@features/ideaValidation/components';

export function DashboardLayout() {
  return (
    <MentorShell>
      <Outlet />
    </MentorShell>
  );
}
