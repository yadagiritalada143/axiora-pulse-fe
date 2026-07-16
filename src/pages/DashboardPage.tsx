import { MessageSquare, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PageHeader } from '@components/common/PageHeader';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { ROUTES } from '@constants/routes';
import { OnboardingFlow } from '@features/onboarding/components';
import { useAuthStore } from '@store/auth.store';

const OVERVIEW_CARDS = [
  { title: 'Active conversations', value: '—', icon: MessageSquare },
  { title: 'Ideas validated', value: '—', icon: Sparkles },
  { title: 'Progress this week', value: '—', icon: TrendingUp },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const onboardingPending = useAuthStore((state) => state.onboardingPending);

  return (
    <div className="space-y-6">
      {onboardingPending && <OnboardingFlow />}
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name}` : ''}`}
        description="Here's a snapshot of your workspace."
        actions={
          <Button asChild>
            <Link to={ROUTES.AI_CHAT}>Talk to your AI co-founder</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OVERVIEW_CARDS.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="text-primary size-4" />
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-2xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
