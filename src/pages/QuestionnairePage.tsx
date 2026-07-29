import { InteractiveQuestionsFlow } from '@/features/onboarding/components';
import { useInteractiveQuestions } from '@features/onboarding/hooks';

export default function QuestionnairePage() {
  const { data: questions = [], isLoading } = useInteractiveQuestions(true);

  if (isLoading) return null;

  return <InteractiveQuestionsFlow questions={questions} />;
}
