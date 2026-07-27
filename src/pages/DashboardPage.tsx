import { MentorShell } from '@features/ideaValidation/components';
import { OnboardingFlow } from '@features/onboarding/components';
import { useAuthStore } from '@store/auth.store';

import WorkspacePage from './WorkspacePage';

export default function DashboardPage() {
  const onboardingPending = useAuthStore((state) => state.onboardingPending);

  return (
    <>
      {onboardingPending && <OnboardingFlow />}

      <MentorShell navItems={[]}>
        <WorkspacePage />
      </MentorShell>
    </>
  );
}
