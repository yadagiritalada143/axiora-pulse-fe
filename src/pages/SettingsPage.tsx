import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { AccountTab, PlanDetailsTab, ProfileTab } from '@features/settings/components';
import { useAuthStore } from '@store/auth.store';

interface SettingsPageProps {
  defaultTab?: 'profile' | 'account' | 'plan';
}

export default function SettingsPage({ defaultTab = 'profile' }: SettingsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const isAdmin = role === 'admin' || user?.role === 'admin';

  const rawTab = searchParams.get('tab') ?? defaultTab;
  const activeTab = isAdmin && rawTab === 'plan' ? 'profile' : rawTab;

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val }, { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
      {/* Page Header matching reference */}
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your preferences, account and security.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
        <TabsList className="border-border h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="profile"
            className="text-muted-foreground cursor-pointer rounded-none border-b-2 border-transparent px-1 pt-1 pb-2.5 text-sm font-semibold transition-colors data-[state=active]:border-b-[#FF4500] data-[state=active]:text-[#FF4500] data-[state=active]:shadow-none"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="text-muted-foreground cursor-pointer rounded-none border-b-2 border-transparent px-1 pt-1 pb-2.5 text-sm font-semibold transition-colors data-[state=active]:border-b-[#FF4500] data-[state=active]:text-[#FF4500] data-[state=active]:shadow-none"
          >
            Account
          </TabsTrigger>
          {!isAdmin && (
            <TabsTrigger
              value="plan"
              className="text-muted-foreground cursor-pointer rounded-none border-b-2 border-transparent px-1 pt-1 pb-2.5 text-sm font-semibold transition-colors data-[state=active]:border-b-[#FF4500] data-[state=active]:text-[#FF4500] data-[state=active]:shadow-none"
            >
              Plan Details
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6 pt-1 focus-visible:outline-none">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="account" className="space-y-6 pt-1 focus-visible:outline-none">
          <AccountTab />
        </TabsContent>

        {!isAdmin && (
          <TabsContent value="plan" className="space-y-6 pt-1 focus-visible:outline-none">
            <PlanDetailsTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
