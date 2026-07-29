import { useInteractiveQuestions } from '@/features/onboarding/hooks';
import { MentorShell } from '@features/ideaValidation/components';
import { InteractiveQuestionsFlow } from '@features/onboarding/components';
import { useAuthStore } from '@store/auth.store';

import WorkspacePage from './WorkspacePage';

export default function DashboardPage() {
  const showQuestionnaireIntro = useAuthStore((state) => state.showQuestionnaireIntro);
  const hasCompletedQuestionnaire = useAuthStore((state) => state.hasCompletedQuestionnaire);
  const shouldLoadQuestions = !showQuestionnaireIntro && !hasCompletedQuestionnaire;
  const { data: questions = [], isLoading } = useInteractiveQuestions(shouldLoadQuestions);
  if (isLoading) {
    return null;
  }

  return (
    <>
      {shouldLoadQuestions && questions.length > 0 && (
        <InteractiveQuestionsFlow questions={questions} />
      )}

      <MentorShell navItems={[]}>
        <WorkspacePage />
      </MentorShell>
    </>
  );
}
