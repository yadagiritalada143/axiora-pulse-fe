import { PageHeader } from '@components/common/PageHeader';
import { AdminUsersTable } from '@features/admin/components';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Registered Users"
        description="View and manage all registered users in Axiora Pulse."
      />
      <AdminUsersTable />
    </div>
  );
}
