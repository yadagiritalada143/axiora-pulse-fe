import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import onboardingBanner from '@/assets/images/questionnaire-banner.png';
import { ThemeToggle } from '@components/common/ThemeToggle';
import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';
import { useAuthStore } from '@store/auth.store';

export default function QuestionnaireIntroPage() {
  const navigate = useNavigate();

  const setShowQuestionnaireIntro = useAuthStore((state) => state.setShowQuestionnaireIntro);

  return (
    <div className="bg-muted/30 relative flex min-h-screen items-center justify-center p-6">
      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="bg-background w-full max-w-4xl overflow-hidden rounded-3xl shadow-xl">
        <img src={onboardingBanner} alt="AI Mentor" className="h-64 w-full object-contain" />

        <div className="space-y-6 p-10 text-center">
          <h1 className="text-4xl font-bold">Help AI Mentor Understand Your Idea</h1>

          <p className="text-muted-foreground text-lg">
            Answer a few questions for a deeper understanding of your idea. Your responses will help
            AI Mentor deliver more accurate analysis.
          </p>

          <p className="font-medium">
            Estimated time: <strong>2–3 minutes</strong>
          </p>

          <div className="flex justify-center gap-5 pt-4">
            <Button
              size="lg"
              onClick={() => {
                setShowQuestionnaireIntro(false);
                void navigate(ROUTES.INTERACTIVE_QUESTIONS);
              }}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
