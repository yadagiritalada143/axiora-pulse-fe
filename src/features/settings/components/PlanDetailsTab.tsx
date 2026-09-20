import {
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  FolderKanban,
  Info,
  ListChecks,
  Loader2,
  Minus,
  PlayCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { ROUTES } from '@constants/routes';
import { useAccountStatus } from '@features/pricing/hooks/useAccountStatus';
import { usePricingPlans } from '@features/pricing/hooks/usePricingPlans';
import { cn } from '@lib/utils';

interface PlanTierMeta {
  id: 'starter' | 'builder' | 'pro';
  name: string;
  idealFor: string;
  strikePrice: number;
  monthlyPrice: number;
  workspaces: string;
  surveyRegeneration: string;
  stageRerun: string;
  surveyAnalytics: 'Basic' | 'Advanced';
  surveyResponses: string;
  exportReport: boolean;
  support: string;
  storage: string;
}

const PLAN_TIERS: Record<'starter' | 'builder' | 'pro', PlanTierMeta> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    idealFor: 'Students exploring 1 ideas',
    strikePrice: 299,
    monthlyPrice: 0,
    workspaces: '1 for 7 days',
    surveyRegeneration: '2 times per workspace',
    stageRerun: '1 per workspace',
    surveyAnalytics: 'Basic',
    surveyResponses: '100 / workspace',
    exportReport: false,
    support: 'Priority',
    storage: '200 MB',
  },
  builder: {
    id: 'builder',
    name: 'Builder',
    idealFor: 'Students building projects/startups',
    strikePrice: 999,
    monthlyPrice: 299,
    workspaces: '3',
    surveyRegeneration: '5 times per workspace',
    stageRerun: '3 per workspace',
    surveyAnalytics: 'Advanced',
    surveyResponses: '500 / workspace',
    exportReport: true,
    support: 'Priority',
    storage: '500 MB',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    idealFor: 'Student founders & power users',
    strikePrice: 1999,
    monthlyPrice: 799,
    workspaces: '10',
    surveyRegeneration: '10 times per workspace',
    stageRerun: '5 per workspace',
    surveyAnalytics: 'Advanced',
    surveyResponses: '2,000 / workspace',
    exportReport: true,
    support: 'Priority',
    storage: '2 GB',
  },
};

interface ComparisonRow {
  feature: string;
  category?: 'overview' | 'agents' | 'quotas' | 'analytics';
  starter: string | boolean;
  builder: string | boolean;
  pro: string | boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'Ideal for',
    category: 'overview',
    starter: 'Students exploring 1 ideas',
    builder: 'Students building projects/startups',
    pro: 'Student founders & power users',
  },
  {
    feature: 'Price / Month',
    category: 'overview',
    starter: '₹0 (was ₹499)',
    builder: '₹299 (was ₹999)',
    pro: '₹799 (was ₹1,999)',
  },
  {
    feature: 'Workspaces / Ideas',
    category: 'overview',
    starter: '1 for 7 days',
    builder: '3',
    pro: '10',
  },
  {
    feature: 'Idea Validation Agent',
    category: 'agents',
    starter: true,
    builder: true,
    pro: true,
  },
  {
    feature: 'Market Research Agent',
    category: 'agents',
    starter: true,
    builder: true,
    pro: true,
  },
  {
    feature: 'Survey Intelligence Agent',
    category: 'agents',
    starter: true,
    builder: true,
    pro: true,
  },
  {
    feature: 'AI-generated Survey',
    category: 'agents',
    starter: true,
    builder: true,
    pro: true,
  },
  {
    feature: 'Survey Editing',
    category: 'agents',
    starter: true,
    builder: true,
    pro: true,
  },
  {
    feature: 'Survey Regeneration',
    category: 'quotas',
    starter: '2 times per workspace',
    builder: '5 times per workspace',
    pro: '10 times per workspace',
  },
  {
    feature: 'Rerun the stage',
    category: 'quotas',
    starter: '1 per workspace',
    builder: '3 per workspace',
    pro: '5 per workspace',
  },
  {
    feature: 'Survey Distribution',
    category: 'quotas',
    starter: true,
    builder: true,
    pro: true,
  },
  {
    feature: 'Survey Analytics',
    category: 'analytics',
    starter: 'Basic',
    builder: 'Advanced',
    pro: 'Advanced',
  },
  {
    feature: 'Survey Responses',
    category: 'quotas',
    starter: '100 / workspace',
    builder: '500 / workspace',
    pro: '2,000 / workspace',
  },
  {
    feature: 'Export the report',
    category: 'analytics',
    starter: false,
    builder: true,
    pro: true,
  },
  {
    feature: 'Support',
    category: 'overview',
    starter: 'Priority',
    builder: 'Priority',
    pro: 'Priority',
  },
  {
    feature: 'Storage',
    category: 'quotas',
    starter: '200 MB',
    builder: '500 MB',
    pro: '2 GB',
  },
];

export function PlanDetailsTab() {
  const navigate = useNavigate();
  const { data: accountStatus, isLoading: isStatusLoading, isError, refetch } = useAccountStatus();
  const { data: catalogPlans, isLoading: isPlansLoading } = usePricingPlans();

  const isLoading = isStatusLoading || isPlansLoading;

  const activePlanKey: 'starter' | 'builder' | 'pro' = useMemo(() => {
    const code = (accountStatus?.plan ?? '').toLowerCase();
    if (code.includes('pro') || code.includes('enterprise')) return 'pro';
    if (code.includes('builder') || code.includes('professional')) return 'builder';
    return 'starter';
  }, [accountStatus?.plan]);

  const activeMeta = PLAN_TIERS[activePlanKey];

  // Match active plan against backend catalog for description or catalog metadata
  const matchingPlan = useMemo(() => {
    if (!catalogPlans || !accountStatus?.plan) return null;
    return (
      catalogPlans.find((p) => p.id.toLowerCase() === accountStatus.plan?.toLowerCase()) ?? null
    );
  }, [catalogPlans, accountStatus]);

  const planName = accountStatus?.planName ?? matchingPlan?.name ?? activeMeta.name;

  const planStatus = accountStatus?.status ?? 'none';
  const billingPeriod = accountStatus?.billingPeriod ?? 'monthly';
  const currency = accountStatus?.currency ?? 'INR';
  const currencySymbol = currency === 'INR' ? '₹' : `${currency} `;

  const price =
    billingPeriod === 'yearly'
      ? (accountStatus?.priceYearly ?? matchingPlan?.priceYearly ?? activeMeta.monthlyPrice * 10)
      : (accountStatus?.priceMonthly ?? matchingPlan?.priceMonthly ?? activeMeta.monthlyPrice);

  const formattedRenewalDate = useMemo(() => {
    const rawDate = accountStatus?.currentEnd;
    if (!rawDate) return null;
    try {
      return new Date(rawDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }, [accountStatus?.currentEnd]);

  const formattedTrialEndDate = useMemo(() => {
    const rawDate = accountStatus?.trialEndsAt;
    if (!rawDate) return null;
    try {
      return new Date(rawDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }, [accountStatus?.trialEndsAt]);

  // Tracked usage numbers directly from BE
  const usedWorkspaces = accountStatus?.usedWorkspaces ?? 0;
  const allowedWorkspaces = accountStatus?.allowedWorkspaces ?? accountStatus?.workspaceLimit ?? 1;
  const workspacePercentage = Math.min(
    100,
    Math.round((usedWorkspaces / (allowedWorkspaces || 1)) * 100),
  );

  const usedResponses = accountStatus?.usedResponses ?? 0;
  const allowedResponses = accountStatus?.allowedResponses ?? accountStatus?.responseCap ?? 100;
  const responsesPercentage = Math.min(
    100,
    Math.round((usedResponses / (allowedResponses || 1)) * 100),
  );

  const storageUsedMB = accountStatus?.storageUsedMB ?? 0;
  const storageLimitMB = accountStatus?.storageLimitMB;
  const storagePercentage =
    storageLimitMB != null && storageLimitMB > 0
      ? Math.min(100, Math.round((storageUsedMB / storageLimitMB) * 100))
      : null;

  // Active benefits for current plan - reactively updates whenever plan changes
  const activePlanBenefits = useMemo(() => {
    const meta = PLAN_TIERS[activePlanKey];
    const wsCount =
      allowedWorkspaces > 0
        ? allowedWorkspaces
        : activePlanKey === 'pro'
          ? 10
          : activePlanKey === 'builder'
            ? 3
            : 1;
    const wsText = `${wsCount} workspace${wsCount > 1 ? 's' : ' for 7 days'}`;

    const respCount =
      allowedResponses > 0
        ? allowedResponses
        : activePlanKey === 'pro'
          ? 2000
          : activePlanKey === 'builder'
            ? 500
            : 100;
    const respText = `${respCount.toLocaleString('en-IN')} survey responses per workspace`;

    const storageText =
      storageLimitMB != null
        ? `${storageLimitMB} MB storage capacity`
        : `${meta.storage} storage capacity`;

    const regenCount =
      accountStatus?.regenerationLimit ??
      (activePlanKey === 'pro' ? 10 : activePlanKey === 'builder' ? 5 : 2);
    const rerunCount =
      accountStatus?.stageRerun ??
      (activePlanKey === 'pro' ? 5 : activePlanKey === 'builder' ? 3 : 1);

    const analyticsTier = accountStatus?.surveyAnalytics ?? meta.surveyAnalytics;
    const isExportAllowed = accountStatus?.exportEnabled ?? meta.exportReport;

    return [
      `Ideal for: ${meta.idealFor}`,
      wsText,
      'Full AI Mentor Agent Suite (Validation, Market Research, Survey Intelligence)',
      'AI-generated Surveys & Custom Survey Editing',
      'Survey Distribution',
      `${regenCount} times per workspace survey regenerations`,
      `${rerunCount} per workspace stage reruns`,
      `${analyticsTier} survey analytics`,
      respText,
      isExportAllowed ? 'Export validation reports (PDF)' : 'Export validation reports disabled',
      storageText,
      `${meta.support} support included`,
    ];
  }, [
    activePlanKey,
    allowedWorkspaces,
    allowedResponses,
    storageLimitMB,
    accountStatus?.regenerationLimit,
    accountStatus?.stageRerun,
    accountStatus?.surveyAnalytics,
    accountStatus?.exportEnabled,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center space-y-3 py-12">
        <Loader2 className="size-8 animate-spin text-[#FF4500]" />
        <p className="text-muted-foreground text-sm">Loading your plan and billing details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive text-sm font-semibold">
          Failed to load plan and billing details.
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Please check your connection and try again.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          className="mt-4 text-xs font-semibold"
        >
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── 1. Top Section: Current Plan & Billing Details ────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Current Plan Card */}
        <Card className="border-border/80 bg-card rounded-2xl p-5 shadow-xs sm:p-6 lg:col-span-7">
          <CardContent className="space-y-4 p-0">
            <div>
              <h3 className="text-foreground text-base font-bold tracking-tight sm:text-lg">
                Current Plan
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                You are currently on the {planName} plan.
              </p>
            </div>

            <div className="border-border/80 bg-muted/30 relative flex flex-col justify-between rounded-xl border p-4.5 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-foreground text-lg font-bold sm:text-xl">{planName}</h4>
                    {planStatus === 'active' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    ) : planStatus === 'trial' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <span className="size-1.5 rounded-full bg-amber-500" /> Free Trial
                      </span>
                    ) : planStatus === 'expired' ? (
                      <span className="bg-destructive/10 text-destructive inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                        <span className="bg-destructive size-1.5 rounded-full" /> Expired
                      </span>
                    ) : (
                      <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                        <span className="bg-muted-foreground size-1.5 rounded-full" /> Free Tier
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {matchingPlan?.description ?? activeMeta.idealFor}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground text-sm line-through">
                      ₹{activeMeta.strikePrice}
                    </span>
                    <span className="text-foreground text-2xl font-extrabold sm:text-3xl">
                      {price != null && price > 0
                        ? `${currencySymbol}${price.toLocaleString('en-IN')}`
                        : '₹0'}
                    </span>
                    {price != null && price > 0 ? (
                      <span className="text-muted-foreground text-xs font-normal">
                        /{billingPeriod === 'yearly' ? 'year' : 'month'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs font-normal">/free</span>
                    )}
                  </div>
                  {planStatus === 'trial' && formattedTrialEndDate ? (
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      Trial ends on:{' '}
                      <span className="text-foreground font-medium">{formattedTrialEndDate}</span>
                    </p>
                  ) : formattedRenewalDate ? (
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      {accountStatus?.cancelAtPeriodEnd
                        ? 'Subscription ends on: '
                        : 'Next billing date: '}
                      <span className="text-foreground font-medium">{formattedRenewalDate}</span>
                    </p>
                  ) : null}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.PRICING)}
                  className="h-9 cursor-pointer gap-1.5 rounded-xl border-[#FF4500]/40 px-4 text-xs font-semibold text-[#FF4500] shadow-2xs hover:border-[#FF4500] hover:bg-[#FF4500]/10 hover:text-[#FF4500]"
                >
                  {planStatus === 'active' ? 'Change Plan' : 'Upgrade Plan'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Billing Details Card */}
        <Card className="border-border/80 bg-card rounded-2xl p-5 shadow-xs sm:p-6 lg:col-span-5">
          <CardContent className="space-y-4 p-0">
            <div>
              <h3 className="text-foreground text-base font-bold tracking-tight sm:text-lg">
                Billing Details
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                Billing cycle, renewal date, and subscription status.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs sm:text-sm">
              <div className="border-border/60 flex items-center justify-between border-b pb-2.5">
                <span className="text-muted-foreground">Billing Cycle</span>
                <span className="text-foreground font-semibold capitalize">
                  {accountStatus?.billingPeriod ? capitalize(accountStatus.billingPeriod) : 'None'}
                </span>
              </div>

              <div className="border-border/60 flex items-center justify-between border-b pb-2.5">
                <span className="text-muted-foreground">Renewal / Expiration</span>
                <span className="text-foreground font-semibold">
                  {planStatus === 'trial'
                    ? (formattedTrialEndDate ?? 'N/A')
                    : (formattedRenewalDate ?? 'N/A')}
                </span>
              </div>

              <div className="border-border/60 flex items-center justify-between border-b pb-2.5">
                <span className="text-muted-foreground">Auto-Renewal</span>
                {accountStatus?.cancelAtPeriodEnd ? (
                  <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                    <span className="size-1.5 rounded-full bg-amber-500" /> Cancels at period end
                  </span>
                ) : planStatus === 'active' ? (
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                ) : (
                  <span className="text-muted-foreground font-medium">Inactive</span>
                )}
              </div>

              <div className="flex items-center justify-between pb-1">
                <span className="text-muted-foreground">Subscription Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 capitalize dark:text-emerald-400">
                  {planStatus === 'active' ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-500" /> Active
                    </>
                  ) : planStatus === 'trial' ? (
                    <>
                      <Calendar className="size-3.5 text-amber-500" /> Free Trial
                    </>
                  ) : planStatus === 'expired' ? (
                    <span className="text-destructive inline-flex items-center gap-1 font-semibold">
                      <XCircle className="text-destructive size-3.5" /> Expired
                    </span>
                  ) : (
                    <span className="text-muted-foreground inline-flex items-center gap-1 font-medium">
                      <Info className="size-3.5" /> Free Tier
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.PRICING)}
                className="h-9 w-full cursor-pointer gap-1.5 rounded-xl border-[#FF4500]/40 text-xs font-semibold text-[#FF4500] shadow-2xs hover:border-[#FF4500] hover:bg-[#FF4500]/10 hover:text-[#FF4500] sm:w-auto sm:px-5"
              >
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 2. Usage Overview (Track usage and limits) ────────────────────── */}
      <Card className="border-border/80 bg-card rounded-2xl p-5 shadow-xs sm:p-6">
        <CardContent className="space-y-4 p-0">
          <div>
            <h3 className="text-foreground text-base font-bold tracking-tight sm:text-lg">
              Usage Overview
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
              Your current usage and plan limits at a glance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Workspaces / Ideas (Tracked DB count) */}
            <div className="border-border/80 bg-muted/20 hover:border-border space-y-3 rounded-xl border p-4 shadow-2xs transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-[#FF4500]">
                  <FolderKanban className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[11px] font-medium">
                    Workspaces / Ideas
                  </p>
                  <p className="text-foreground text-sm font-bold sm:text-base">
                    {usedWorkspaces} / {allowedWorkspaces}
                  </p>
                </div>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#FF4500] transition-all duration-300"
                  style={{ width: `${workspacePercentage}%` }}
                />
              </div>
            </div>

            {/* Card 2: Survey Responses (Tracked DB count) */}
            <div className="border-border/80 bg-muted/20 hover:border-border space-y-3 rounded-xl border p-4 shadow-2xs transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[11px] font-medium">Survey Responses</p>
                  <p className="text-foreground text-sm font-bold sm:text-base">
                    {usedResponses} / {allowedResponses}
                  </p>
                </div>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${responsesPercentage}%` }}
                />
              </div>
            </div>

            {/* Card 3: Storage (Tracked attachment bytes) */}
            <div className="border-border/80 bg-muted/20 hover:border-border space-y-3 rounded-xl border p-4 shadow-2xs transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Database className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[11px] font-medium">Storage</p>
                  <p className="text-foreground text-sm font-bold sm:text-base">
                    {storageLimitMB != null
                      ? `${storageUsedMB} MB / ${storageLimitMB} MB`
                      : `${storageUsedMB} MB (Limit: ${activeMeta.storage})`}
                  </p>
                </div>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${storagePercentage ?? 100}%` }}
                />
              </div>
            </div>

            {/* Card 4: Survey Regenerations (Plan Quota) */}
            <div className="border-border/80 bg-muted/20 hover:border-border space-y-3 rounded-xl border p-4 shadow-2xs transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <RefreshCw className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[11px] font-medium">
                    Survey Regenerations
                  </p>
                  <p className="text-foreground text-sm font-bold sm:text-base">
                    {accountStatus?.regenerationLimit != null
                      ? `${accountStatus.regenerationLimit} / workspace`
                      : activeMeta.surveyRegeneration}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-[11px]">Plan quota per idea workspace</p>
            </div>

            {/* Card 5: Stage Reruns (Plan Quota) */}
            <div className="border-border/80 bg-muted/20 hover:border-border space-y-3 rounded-xl border p-4 shadow-2xs transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <PlayCircle className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[11px] font-medium">Stage Reruns</p>
                  <p className="text-foreground text-sm font-bold sm:text-base">
                    {accountStatus?.stageRerun != null
                      ? `${accountStatus.stageRerun} / workspace`
                      : activeMeta.stageRerun}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Stage re-runs allowed per workspace
              </p>
            </div>

            {/* Card 6: Report Export & Analytics (Entitlements) */}
            <div className="border-border/80 bg-muted/20 hover:border-border space-y-3 rounded-xl border p-4 shadow-2xs transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <BarChart3 className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[11px] font-medium">
                    Analytics & Export
                  </p>
                  <p className="text-foreground text-sm font-bold sm:text-base">
                    {accountStatus?.surveyAnalytics ?? activeMeta.surveyAnalytics} Analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-muted-foreground">Report Export:</span>
                {(accountStatus?.exportEnabled ?? activeMeta.exportReport) ? (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Enabled
                  </span>
                ) : (
                  <span className="text-muted-foreground font-medium">Disabled</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Plan Features Section (Current Plan Benefits) ───────────────── */}
      <Card className="border-border/80 bg-card rounded-2xl p-5 shadow-xs sm:p-6">
        <CardContent className="space-y-4 p-0">
          <div className="flex items-center gap-2">
            <ListChecks className="size-5 text-[#FF4500]" />
            <div>
              <h3 className="text-foreground text-base font-bold tracking-tight sm:text-lg">
                Plan Features
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                Benefits and quotas included with your {planName} plan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {activePlanBenefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm">
                <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3" strokeWidth={3} />
                </div>
                <span className="text-foreground/90 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 4. Comprehensive Plan Comparison Matrix (All Tiers) ───────────── */}
      <Card className="border-border/80 bg-card rounded-2xl p-5 shadow-xs sm:p-6">
        <CardContent className="space-y-4 p-0">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-foreground text-base font-bold tracking-tight sm:text-lg">
                AI Mentor Plan Comparison
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Compare features and limits across all tiers to choose the right fit.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.PRICING)}
              className="border-border hover:bg-muted text-foreground mt-2 h-8 rounded-lg px-3 text-xs font-semibold sm:mt-0"
            >
              <ExternalLink className="mr-1.5 size-3" />
              View Pricing Page
            </Button>
          </div>

          <div className="border-border/80 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[620px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-muted/50 border-border/80 border-b">
                  <th className="text-foreground w-1/4 px-4 py-3.5 text-[11px] font-bold tracking-wider uppercase">
                    Feature
                  </th>
                  {(['starter', 'builder', 'pro'] as const).map((tierKey) => {
                    const tier = PLAN_TIERS[tierKey];
                    const isActive = activePlanKey === tierKey;
                    return (
                      <th
                        key={tierKey}
                        className={cn(
                          'w-1/4 px-4 py-3.5 text-center font-bold transition-colors',
                          isActive ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'text-foreground',
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-extrabold sm:text-base">{tier.name}</span>
                          {isActive && (
                            <span className="inline-flex items-center rounded-full bg-[#FF4500] px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                              Your Plan
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr
                    key={idx}
                    className={cn(
                      'hover:bg-muted/20 transition-colors',
                      idx % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                    )}
                  >
                    <td className="text-foreground px-4 py-3 font-medium">{row.feature}</td>

                    {(['starter', 'builder', 'pro'] as const).map((tierKey) => {
                      const val = row[tierKey];
                      const isActive = activePlanKey === tierKey;

                      return (
                        <td
                          key={tierKey}
                          className={cn(
                            'px-4 py-3 text-center text-xs sm:text-sm',
                            isActive
                              ? 'text-foreground bg-[#FF4500]/5 font-semibold'
                              : 'text-muted-foreground',
                          )}
                        >
                          {typeof val === 'boolean' ? (
                            val ? (
                              <span className="inline-flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Check className="size-4 stroke-[2.5]" />
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60 inline-flex items-center justify-center">
                                <Minus className="size-4" />
                              </span>
                            )
                          ) : (
                            <span>{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
