import { useState } from 'react';

import type { OrchestrationRunResponse } from '@/types/orchestration.types';
import {
  IdeaInputForm,
  IdeaValidationReport,
  MentorShell,
} from '@features/ideaValidation/components';
import { OnboardingFlow } from '@features/onboarding/components';
import { useAuthStore } from '@store/auth.store';

export default function DashboardPage() {
  const onboardingPending = useAuthStore((state) => state.onboardingPending);
  const [submittedTitle, setSubmittedTitle] = useState('');
  const [validation, setValidation] = useState<OrchestrationRunResponse | null>(null);

  return (
    <>
      {onboardingPending && <OnboardingFlow />}
      <MentorShell>
        {validation ? (
          <IdeaValidationReport
            ideaTitle={submittedTitle}
            response={validation}
            onRetake={() => setValidation(null)}
          />
        ) : (
          <IdeaInputForm
            onValidated={(response, title) => {
              setSubmittedTitle(title);
              setValidation(response);
            }}
          />
        )}
      </MentorShell>
    </>
  );
}
