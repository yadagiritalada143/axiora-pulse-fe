import { useNavigate } from 'react-router-dom';

import { InteractiveQuestionsFlow } from '@/features/onboarding/components';
import { ROUTES } from '@constants/routes';
import { useInteractiveQuestions } from '@features/onboarding/hooks';

export default function InteractiveQuestionsPage() {
  const navigate = useNavigate();

  const { data: questions = [], isLoading } = useInteractiveQuestions(true);

  if (isLoading) return null;

  return (
    <InteractiveQuestionsFlow
      questions={questions}
      onCompleted={() => {
        void navigate(ROUTES.DASHBOARD);
      }}
    />
  );
}
