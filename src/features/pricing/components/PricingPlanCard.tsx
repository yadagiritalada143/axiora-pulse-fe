import { Check } from 'lucide-react';

import type { PricingPlan } from '@/types/api.types';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { cn } from '@lib/utils';

interface PricingPlanCardProps {
  plan: PricingPlan;
  billingPeriod: 'monthly' | 'yearly';
  highlighted?: boolean;
  onSelect: (planId: string) => void;
}

export function PricingPlanCard({
  plan,
  billingPeriod,
  highlighted,
  onSelect,
}: PricingPlanCardProps) {
  const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;

  return (
    <Card className={cn('flex flex-col', highlighted && 'border-primary shadow-md')}>
      <CardHeader>
        <CardTitle className={cn(highlighted && 'text-primary')}>{plan.name}</CardTitle>
        <p className="text-foreground text-3xl font-semibold">
          ${price}
          <span className="text-muted-foreground text-sm font-normal">
            /{billingPeriod === 'monthly' ? 'month' : 'year'}
          </span>
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="text-muted-foreground space-y-2 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="text-primary mt-0.5 size-4 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={highlighted ? 'default' : 'outline'}
          onClick={() => onSelect(plan.id)}
        >
          Choose plan
        </Button>
      </CardFooter>
    </Card>
  );
}
