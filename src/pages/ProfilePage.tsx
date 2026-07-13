import { PageHeader } from '@components/common/PageHeader';
import { ProfileForm } from '@features/settings/components/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your personal information." />
      <ProfileForm />
    </div>
  );
}
