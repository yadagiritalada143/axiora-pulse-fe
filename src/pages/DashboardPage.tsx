import { useState } from 'react';

import type { OrchestrationRunResponse } from '@/types/orchestration.types';
import { IdeaInputForm, IdeaValidationReport } from '@features/ideaValidation/components';
import { InteractiveQuestionsFlow, OnboardingFlow } from '@features/onboarding/components';
import { useInteractiveQuestions } from '@features/onboarding/hooks';
import { useAuthStore } from '@store/auth.store';

export default function DashboardPage() {
  const onboardingPending = useAuthStore((state) => state.onboardingPending);
  const hasActivePlan = useAuthStore((state) => state.hasActivePlan);
  const [submittedTitle, setSubmittedTitle] = useState('');
  const [validation, setValidation] = useState<OrchestrationRunResponse | null>(null);

  const { data: interactiveQuestions } = useInteractiveQuestions(
    hasActivePlan && !onboardingPending,
  );

  return (
    <>
      {onboardingPending && <OnboardingFlow />}

      {!onboardingPending && hasActivePlan && !!interactiveQuestions?.length && (
        <InteractiveQuestionsFlow questions={interactiveQuestions} />
      )}

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
    </>
  );
}
