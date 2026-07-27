import { ArrowRight, Building2, MessageSquare, Sparkles, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes';
import { MentorShell } from '@features/ideaValidation/components';
import { OnboardingFlow } from '@features/onboarding/components';
import { useAuthStore } from '@store/auth.store';

export default function DashboardPage() {
  const onboardingPending = useAuthStore((state) => state.onboardingPending);
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {onboardingPending && <OnboardingFlow />}

      <MentorShell>
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <div>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back{user?.name ? `, ${user.name}` : ''}.
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Your AI co-founder is ready. Open a workspace to validate an idea, or create a new one
              to get started.
            </p>
          </div>

          <div className="border-border bg-primary/5 flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-foreground text-base font-semibold">Start with a workspace</p>
              <p className="text-muted-foreground text-sm">
                Every idea validation lives inside a workspace. Pick one to begin.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link to={ROUTES.WORKSPACE}>
                Go to Workspaces
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={Building2}
              title="Workspaces"
              description="Organize your ideas, chats, and reports into focused workspaces."
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Mentor"
              description="Validate a startup idea and get a scored report with strengths and risks."
            />
            <FeatureCard
              icon={MessageSquare}
              title="AI Chat"
              description="Talk through your idea with your AI co-founder anytime."
            />
          </div>
        </div>
      </MentorShell>
    </>
  );
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="border-border rounded-xl border p-5">
      <span className="bg-primary/10 text-primary mb-3 flex size-9 items-center justify-center rounded-lg">
        <Icon className="size-4" aria-hidden />
      </span>
      <p className="text-foreground text-sm font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  );
}
