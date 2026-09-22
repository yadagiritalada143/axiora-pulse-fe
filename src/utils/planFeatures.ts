export interface PlanQuotaSource {
  id?: string | number;
  code?: string;
  name?: string;
  price_monthly?: number;
  priceMonthly?: number;
  price_yearly?: number;
  priceYearly?: number;
  old_price?: number | null;
  oldPrice?: number | null;
  workspace_limit?: number | null;
  survey_response_cap?: number | null;
  regeneration_limit?: number | null;
  export_enabled?: boolean;
  stage_rerun?: number | null;
  survey_analytics?: string | null;
  storage_limit?: number | null;
  features?: string[];
}

export function isFreePlan(plan?: PlanQuotaSource | null): boolean {
  if (!plan) return true;
  const price = plan.price_monthly ?? plan.priceMonthly ?? 0;
  const code = (plan.code ?? (plan.id != null ? String(plan.id) : '')).toLowerCase();
  const name = (plan.name ?? '').toLowerCase();
  return price === 0 || code === 'starter' || code === 'free' || name === 'starter';
}

export function formatStorageSize(limitMB: number | null | undefined): string {
  if (limitMB == null || limitMB <= 0) return '200 MB';
  if (limitMB >= 1024) {
    const gb = Math.round((limitMB / 1024) * 10) / 10;
    return `${gb} GB`;
  }
  return `${limitMB} MB`;
}

/**
 * Standard feature templates written ONE TIME.
 * Each template interpolates the plan's quota numbers:
 * - Workspaces: "{} workspace/idea for 7 days" (free) or "{} workspaces/ideas"
 * - Survey regenerations: "{} survey regenerations per workspace"
 * - Stage reruns: "{} stage reruns per workspace"
 * - Survey analytics: "{} survey analytics"
 * - Survey responses: "{} survey responses per workspace"
 * - Export validation reports: "Export validation reports" (conditional on export_enabled)
 * - Storage: "{} storage"
 */
export const PLAN_FEATURE_TEMPLATES = [
  // 1. Workspaces
  {
    key: 'workspaces',
    format: (plan: PlanQuotaSource): string | null => {
      const isFree = isFreePlan(plan);
      const ws = plan.workspace_limit ?? (isFree ? 1 : null);
      if (ws == null) return null;
      return isFree || ws === 1 ? `${ws} workspace/idea for 7 days` : `${ws} workspaces/ideas`;
    },
  },
  // 2. Survey regenerations
  {
    key: 'survey_regenerations',
    format: (plan: PlanQuotaSource): string | null => {
      const regen = plan.regeneration_limit;
      if (regen == null) return null;
      return `${regen} survey regeneration${regen === 1 ? '' : 's'} per workspace`;
    },
  },
  // 3. Stage reruns
  {
    key: 'stage_rerun',
    format: (plan: PlanQuotaSource): string | null => {
      const rerun = plan.stage_rerun;
      if (rerun == null) return null;
      return `${rerun} stage rerun${rerun === 1 ? '' : 's'} per workspace`;
    },
  },
  // 4. Survey analytics
  {
    key: 'survey_analytics',
    format: (plan: PlanQuotaSource): string => {
      const analytics = plan.survey_analytics ?? 'Basic';
      return `${analytics} survey analytics`;
    },
  },
  // 5. Survey responses
  {
    key: 'survey_responses',
    format: (plan: PlanQuotaSource): string | null => {
      const responses = plan.survey_response_cap;
      if (responses == null) return null;
      return `${responses.toLocaleString('en-US')} survey responses per workspace`;
    },
  },
  // 6. Export validation reports (Builder & Pro only, omitted for free/Starter)
  {
    key: 'export_reports',
    format: (plan: PlanQuotaSource): string | null => {
      if (isFreePlan(plan) || !plan.export_enabled) return null;
      return 'Export validation reports';
    },
  },
  // 7. Storage
  {
    key: 'storage',
    format: (plan: PlanQuotaSource): string | null => {
      const storage = plan.storage_limit;
      if (storage == null) return null;
      return `${formatStorageSize(storage)} storage`;
    },
  },
] as const;

/**
 * Loops over the standard feature templates to dynamically generate
 * the plan features for any plan based on its backend quotas.
 */
export function generatePlanFeatures(plan: PlanQuotaSource): string[] {
  const items: string[] = [];
  for (const template of PLAN_FEATURE_TEMPLATES) {
    const feature = template.format(plan);
    if (feature) {
      items.push(feature);
    }
  }
  return items;
}

export interface PlanComparisonRow {
  key: string;
  feature: string;
  category?: 'overview' | 'quotas' | 'analytics';
  getValue: (plan: PlanQuotaSource) => string | boolean;
}

/**
 * Standard dynamic comparison rows used in Plan Comparison matrix
 * (Settings -> Plan Details and Admin side).
 * Purely data-driven from BE quotas with NO hardcoded static agent rows.
 */
export const DYNAMIC_PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  {
    key: 'price',
    feature: 'Price / Month',
    category: 'overview',
    getValue: (plan) =>
      `₹${(plan.price_monthly ?? plan.priceMonthly ?? 0).toLocaleString('en-IN')}`,
  },
  {
    key: 'workspaces',
    feature: 'Workspaces / Ideas',
    category: 'overview',
    getValue: (plan) => {
      const isFree = isFreePlan(plan);
      const ws = plan.workspace_limit ?? (isFree ? 1 : null);
      if (ws == null) return 'Unlimited';
      return isFree || ws === 1 ? `${ws} for 7 days` : `${ws}`;
    },
  },
  {
    key: 'survey_regenerations',
    feature: 'Survey Regenerations',
    category: 'quotas',
    getValue: (plan) => {
      const regen = plan.regeneration_limit;
      if (regen == null) return 'Unlimited';
      return `${regen} times per workspace`;
    },
  },
  {
    key: 'stage_rerun',
    feature: 'Rerun the stage',
    category: 'quotas',
    getValue: (plan) => {
      const rerun = plan.stage_rerun;
      if (rerun == null) return 'Not allowed';
      return `${rerun} per workspace`;
    },
  },
  {
    key: 'survey_analytics',
    feature: 'Survey Analytics',
    category: 'analytics',
    getValue: (plan) => plan.survey_analytics ?? 'Basic',
  },
  {
    key: 'survey_responses',
    feature: 'Survey Responses',
    category: 'quotas',
    getValue: (plan) => {
      const responses = plan.survey_response_cap;
      if (responses == null) return 'Unlimited';
      return `${responses.toLocaleString('en-IN')} / workspace`;
    },
  },
  {
    key: 'export_reports',
    feature: 'Export Validation Reports',
    category: 'analytics',
    getValue: (plan) => {
      if (isFreePlan(plan)) return false;
      return Boolean(plan.export_enabled);
    },
  },
  {
    key: 'storage',
    feature: 'Storage',
    category: 'quotas',
    getValue: (plan) => formatStorageSize(plan.storage_limit),
  },
];
