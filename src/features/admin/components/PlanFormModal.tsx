import {
  Check,
  CreditCard,
  Database,
  FileText,
  Info,
  Layers,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import type {
  AdminPlan,
  CreatePlanWithRazorpayPayload,
  UpdatePlanPayload,
} from '@/types/admin.types';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Checkbox } from '@components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';

interface PlanFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  plan?: AdminPlan | null;
  isPending: boolean;
  onClose: () => void;
  onCreate: (payload: CreatePlanWithRazorpayPayload) => void;
  onUpdate: (planId: number, payload: UpdatePlanPayload) => void;
}

interface PlanFormContentProps {
  mode: 'create' | 'edit';
  plan?: AdminPlan | null;
  isPending: boolean;
  onClose: () => void;
  onCreate: (payload: CreatePlanWithRazorpayPayload) => void;
  onUpdate: (planId: number, payload: UpdatePlanPayload) => void;
}

function PlanFormContent({
  mode,
  plan,
  isPending,
  onClose,
  onCreate,
  onUpdate,
}: PlanFormContentProps) {
  const [code, setCode] = useState(() => (mode === 'edit' && plan ? plan.code : ''));
  const [name, setName] = useState(() => (mode === 'edit' && plan ? plan.name : ''));
  const [description, setDescription] = useState(() =>
    mode === 'edit' && plan ? (plan.description ?? '') : '',
  );
  const [tier, setTier] = useState<number>(() => (mode === 'edit' && plan ? plan.tier : 0));
  const [isPopular, setIsPopular] = useState(() =>
    mode === 'edit' && plan ? Boolean(plan.popular) : false,
  );
  const [isActive, setIsActive] = useState(() =>
    mode === 'edit' && plan ? Boolean(plan.is_active) : true,
  );

  const [priceMonthly, setPriceMonthly] = useState<number>(() =>
    mode === 'edit' && plan ? plan.price_monthly : 0,
  );
  const [priceYearly, setPriceYearly] = useState<number>(() =>
    mode === 'edit' && plan ? plan.price_yearly : 0,
  );
  const [currency, setCurrency] = useState(() =>
    mode === 'edit' && plan ? plan.currency || 'INR' : 'INR',
  );

  const [workspaceLimit, setWorkspaceLimit] = useState<string>(() =>
    mode === 'edit' && plan
      ? plan.workspace_limit != null
        ? String(plan.workspace_limit)
        : ''
      : '1',
  );
  const [surveyResponseCap, setSurveyResponseCap] = useState<string>(() =>
    mode === 'edit' && plan
      ? plan.survey_response_cap != null
        ? String(plan.survey_response_cap)
        : ''
      : '100',
  );
  const [storageLimitMB, setStorageLimitMB] = useState<string>(() =>
    mode === 'edit' && plan
      ? plan.storage_limit != null
        ? String(plan.storage_limit)
        : ''
      : '200',
  );
  const [regenerationLimit, setRegenerationLimit] = useState<string>(() =>
    mode === 'edit' && plan
      ? plan.regeneration_limit != null
        ? String(plan.regeneration_limit)
        : ''
      : '2',
  );
  const [stageRerun, setStageRerun] = useState<string>(() =>
    mode === 'edit' && plan ? (plan.stage_rerun != null ? String(plan.stage_rerun) : '') : '1',
  );
  const [surveyAnalytics, setSurveyAnalytics] = useState<'Basic' | 'Advanced'>(() =>
    mode === 'edit' && plan?.survey_analytics === 'Advanced' ? 'Advanced' : 'Basic',
  );
  const [exportEnabled, setExportEnabled] = useState(() =>
    mode === 'edit' && plan ? Boolean(plan.export_enabled) : true,
  );

  const [features, setFeatures] = useState<string[]>(() => {
    if (mode === 'edit' && plan) {
      return Array.isArray(plan.features) ? [...plan.features] : [];
    }
    return [
      '1 workspace/idea for 7 days',
      '2 survey regenerations per workspace',
      '1 stage rerun per workspace',
      'Basic survey analytics',
      '100 survey responses per workspace',
      '200 MB storage allowance',
    ];
  });
  const [newFeatureText, setNewFeatureText] = useState('');

  const [razorpayPlanIdMonthly, setRazorpayPlanIdMonthly] = useState(() =>
    mode === 'edit' && plan ? (plan.razorpay_plan_id_monthly ?? '') : '',
  );
  const [razorpayPlanIdYearly, setRazorpayPlanIdYearly] = useState(() =>
    mode === 'edit' && plan ? (plan.razorpay_plan_id_yearly ?? '') : '',
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddFeature = () => {
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    if (features.includes(trimmed)) {
      setErrorMsg('This feature is already added.');
      return;
    }
    setFeatures((prev) => [...prev, trimmed]);
    setNewFeatureText('');
    setErrorMsg(null);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedCode = code.trim();
    const trimmedName = name.trim();

    if (!trimmedCode) {
      setErrorMsg('Plan code is required (e.g. starter, builder, pro).');
      return;
    }
    if (!trimmedName) {
      setErrorMsg('Display name is required (e.g. Starter, Builder, Pro).');
      return;
    }
    if (priceMonthly < 0 || priceYearly < 0) {
      setErrorMsg('Prices must be non-negative.');
      return;
    }

    const parseOptionalInt = (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return null;
      const num = parseInt(trimmed, 10);
      return isNaN(num) ? null : num;
    };

    if (mode === 'create') {
      const payload: CreatePlanWithRazorpayPayload = {
        code: trimmedCode,
        name: trimmedName,
        description: description.trim() || null,
        tier: Number(tier) || 0,
        price_monthly: Number(priceMonthly) || 0,
        price_yearly: Number(priceYearly) || 0,
        currency: currency.trim() || 'INR',
        features,
        popular: isPopular,
        is_active: isActive,
        workspace_limit: parseOptionalInt(workspaceLimit),
        survey_response_cap: parseOptionalInt(surveyResponseCap),
        storage_limit: parseOptionalInt(storageLimitMB),
        regeneration_limit: parseOptionalInt(regenerationLimit),
        stage_rerun: parseOptionalInt(stageRerun),
        survey_analytics: surveyAnalytics,
        export_enabled: exportEnabled,
        razorpay_plan_id_monthly: razorpayPlanIdMonthly.trim() || null,
        razorpay_plan_id_yearly: razorpayPlanIdYearly.trim() || null,
      };
      onCreate(payload);
    } else if (mode === 'edit' && plan) {
      const payload: UpdatePlanPayload = {
        code: trimmedCode,
        name: trimmedName,
        description: description.trim() || null,
        tier: Number(tier) || 0,
        price_monthly: Number(priceMonthly) || 0,
        price_yearly: Number(priceYearly) || 0,
        currency: currency.trim() || 'INR',
        features,
        popular: isPopular,
        is_active: isActive,
        workspace_limit: parseOptionalInt(workspaceLimit),
        survey_response_cap: parseOptionalInt(surveyResponseCap),
        storage_limit: parseOptionalInt(storageLimitMB),
        regeneration_limit: parseOptionalInt(regenerationLimit),
        stage_rerun: parseOptionalInt(stageRerun),
        survey_analytics: surveyAnalytics,
        export_enabled: exportEnabled,
        razorpay_plan_id_monthly: razorpayPlanIdMonthly.trim() || null,
        razorpay_plan_id_yearly: razorpayPlanIdYearly.trim() || null,
      };
      onUpdate(plan.id, payload);
    }
  };

  return (
    <>
      {errorMsg ? (
        <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-xs font-medium">
          {errorMsg}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="border-border bg-card/60 space-y-4 rounded-xl border p-4">
          <div className="border-border/60 flex items-center gap-2 border-b pb-2">
            <Info className="size-4 text-[#FF4500]" />
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              1. Basic Information
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-code" className="text-xs font-semibold">
                Plan Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="plan-code"
                placeholder="e.g. starter, builder, pro"
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                disabled={isPending}
                className="font-mono text-xs"
                required
              />
              <p className="text-muted-foreground text-[11px]">
                Unique identifier code for this plan (e.g. starter, builder, enterprise).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plan-name" className="text-xs font-semibold">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="plan-name"
                placeholder="e.g. Starter, Builder, Pro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                className="text-xs"
                required
              />
              <p className="text-muted-foreground text-[11px]">
                Title shown to customers across pricing pages.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-desc" className="text-xs font-semibold">
              Plan Summary / Description
            </Label>
            <Textarea
              id="plan-desc"
              placeholder="Short description of who this plan is tailored for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={2}
              className="resize-none text-xs"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-tier" className="text-xs font-semibold">
                Display Order (Tier Level)
              </Label>
              <Input
                id="plan-tier"
                type="number"
                min={0}
                value={tier}
                onChange={(e) => setTier(Math.max(0, parseInt(e.target.value, 10) || 0))}
                disabled={isPending}
                className="text-xs"
              />
              <p className="text-muted-foreground text-[11px]">
                Listing order: 0 for Free tier, 1 for Builder, etc.
              </p>
            </div>

            <div className="flex flex-col justify-center space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="plan-popular"
                  checked={isPopular}
                  onCheckedChange={(checked) => setIsPopular(Boolean(checked))}
                  disabled={isPending}
                />
                <Label htmlFor="plan-popular" className="cursor-pointer text-xs font-semibold">
                  Mark as Popular
                </Label>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Visually highlights this card on the public pricing page.
              </p>
            </div>

            <div className="flex flex-col justify-center space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="plan-active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                  disabled={isPending}
                />
                <Label htmlFor="plan-active" className="cursor-pointer text-xs font-semibold">
                  Publicly Available
                </Label>
              </div>
              <p className="text-muted-foreground text-[11px]">
                When enabled, users can view and select this plan.
              </p>
            </div>
          </div>
        </div>

        <div className="border-border bg-card/60 space-y-4 rounded-xl border p-4">
          <div className="border-border/60 flex items-center gap-2 border-b pb-2">
            <CreditCard className="size-4 text-[#FF4500]" />
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              2. Pricing & Currency
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="price-monthly" className="text-xs font-semibold">
                Monthly Price (₹)
              </Label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-2.5 left-3 text-xs">₹</span>
                <Input
                  id="price-monthly"
                  type="number"
                  min={0}
                  value={priceMonthly}
                  onChange={(e) => setPriceMonthly(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  disabled={isPending}
                  className="pl-7 text-xs font-semibold"
                />
              </div>
              <p className="text-muted-foreground text-[11px]">0 = Free tier</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price-yearly" className="text-xs font-semibold">
                Yearly Price (₹)
              </Label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-2.5 left-3 text-xs">₹</span>
                <Input
                  id="price-yearly"
                  type="number"
                  min={0}
                  value={priceYearly}
                  onChange={(e) => setPriceYearly(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  disabled={isPending}
                  className="pl-7 text-xs font-semibold"
                />
              </div>
              <p className="text-muted-foreground text-[11px]">Discounted annual rate</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currency" className="text-xs font-semibold">
                Currency
              </Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                disabled={isPending}
                className="font-mono text-xs uppercase"
                maxLength={3}
              />
              <p className="text-muted-foreground text-[11px]">ISO code (default INR)</p>
            </div>
          </div>
        </div>

        <div className="border-border bg-card/60 space-y-4 rounded-xl border p-4">
          <div className="border-border/60 flex items-center gap-2 border-b pb-2">
            <Database className="size-4 text-[#FF4500]" />
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
              3. Quotas & Capabilities
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="workspace-limit" className="text-xs font-semibold">
                Workspaces Limit
              </Label>
              <Input
                id="workspace-limit"
                type="number"
                min={0}
                placeholder="Leave empty for Unlimited"
                value={workspaceLimit}
                onChange={(e) => setWorkspaceLimit(e.target.value)}
                disabled={isPending}
                className="text-xs"
              />
              <p className="text-muted-foreground text-[11px]">Max active ideas/workspaces</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-cap" className="text-xs font-semibold">
                Survey Response Cap
              </Label>
              <Input
                id="survey-cap"
                type="number"
                min={0}
                placeholder="Leave empty for Unlimited"
                value={surveyResponseCap}
                onChange={(e) => setSurveyResponseCap(e.target.value)}
                disabled={isPending}
                className="text-xs"
              />
              <p className="text-muted-foreground text-[11px]">Per workspace responses</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="storage-limit" className="text-xs font-semibold">
                Storage Allowance (MB)
              </Label>
              <Input
                id="storage-limit"
                type="number"
                min={0}
                placeholder="e.g. 200, 500, 2048"
                value={storageLimitMB}
                onChange={(e) => setStorageLimitMB(e.target.value)}
                disabled={isPending}
                className="text-xs"
              />
              <p className="text-muted-foreground text-[11px]">Leave empty for unlimited</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="regen-limit" className="text-xs font-semibold">
                Regenerations
              </Label>
              <Input
                id="regen-limit"
                type="number"
                min={0}
                placeholder="e.g. 2, 5, 10"
                value={regenerationLimit}
                onChange={(e) => setRegenerationLimit(e.target.value)}
                disabled={isPending}
                className="text-xs"
              />
              <p className="text-muted-foreground text-[11px]">Survey regenerations</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stage-rerun" className="text-xs font-semibold">
                Stage Re-runs
              </Label>
              <Input
                id="stage-rerun"
                type="number"
                min={0}
                placeholder="e.g. 1, 3, 5"
                value={stageRerun}
                onChange={(e) => setStageRerun(e.target.value)}
                disabled={isPending}
                className="text-xs"
              />
              <p className="text-muted-foreground text-[11px]">Reruns per workspace</p>
            </div>

            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="survey-analytics" className="text-xs font-semibold">
                Survey Analytics
              </Label>

              <Select
                value={surveyAnalytics}
                onValueChange={(val: 'Basic' | 'Advanced') => setSurveyAnalytics(val)}
                disabled={isPending}
              >
                <SelectTrigger id="survey-analytics" className="h-9 w-full min-w-0 text-xs">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-0">
                  <SelectItem value="Basic" className="truncate text-xs">
                    Basic Analytics
                  </SelectItem>

                  <SelectItem value="Advanced" className="truncate text-xs">
                    Advanced Analytics
                  </SelectItem>
                </SelectContent>
              </Select>

              <p className="text-muted-foreground text-[11px]">Sentiment & deep insights</p>
            </div>

            <div className="flex flex-col justify-center space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="export-enabled"
                  checked={exportEnabled}
                  onCheckedChange={(checked) => setExportEnabled(Boolean(checked))}
                  disabled={isPending}
                />
                <Label htmlFor="export-enabled" className="cursor-pointer text-xs font-semibold">
                  Report Export
                </Label>
              </div>
              <p className="text-muted-foreground text-[11px]">Allow PDF/Certificate export</p>
            </div>
          </div>
        </div>

        <div className="border-border bg-card/60 space-y-4 rounded-xl border p-4">
          <div className="border-border/60 flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-[#FF4500]" />
              <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
                4. Plan Features & Benefits ({features.length})
              </h4>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Shown directly on pricing page
            </Badge>
          </div>

          <div className="flex w-full items-center gap-2">
            <Input
              placeholder="Type a new benefit bullet point and press Enter or Add..."
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              disabled={isPending}
              className="h-9 flex-1 text-xs"
            />

            <Button
              type="button"
              size="sm"
              onClick={handleAddFeature}
              disabled={isPending || !newFeatureText.trim()}
              className="h-9 shrink-0 gap-1 bg-[#FF4500] px-3 text-xs font-semibold text-white hover:bg-[#FF4500]/90"
            >
              <Plus className="size-3" />
              Add
            </Button>
          </div>

          {features.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-xs italic">
              No features added yet. Add feature bullet points to present to users.
            </p>
          ) : (
            <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {features.map((feature, idx) => (
                <li
                  key={idx}
                  className="border-border bg-background hover:border-border/80 flex items-center justify-between gap-3 rounded-lg border p-2.5 text-xs transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3" strokeWidth={3} />
                    </div>
                    <span className="text-foreground/90 truncate font-medium">{feature}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFeature(idx)}
                    disabled={isPending}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-7 shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs">
          <div className="flex items-start gap-2.5 text-blue-700 dark:text-blue-300">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Automated Payment Synchronization</p>
              <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                For paid subscription tiers (price &gt; 0), recurring monthly and yearly billing
                schedules are automatically created and synchronized with Razorpay. You can also
                specify custom Razorpay Plan IDs below if using pre-configured plans from your
                dashboard.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <div className="space-y-1">
              <Label
                htmlFor="rp-monthly"
                className="text-muted-foreground text-[11px] font-semibold"
              >
                Custom Razorpay Monthly Plan ID (Optional)
              </Label>
              <Input
                id="rp-monthly"
                placeholder="e.g. plan_N123456789"
                value={razorpayPlanIdMonthly}
                onChange={(e) => setRazorpayPlanIdMonthly(e.target.value)}
                disabled={isPending}
                className="h-8 font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="rp-yearly"
                className="text-muted-foreground text-[11px] font-semibold"
              >
                Custom Razorpay Yearly Plan ID (Optional)
              </Label>
              <Input
                id="rp-yearly"
                placeholder="e.g. plan_N987654321"
                value={razorpayPlanIdYearly}
                onChange={(e) => setRazorpayPlanIdYearly(e.target.value)}
                disabled={isPending}
                className="h-8 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="gap-2 bg-[#FF4500] text-xs font-semibold text-white shadow-xs hover:bg-[#FF4500]/90"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {mode === 'create' ? 'Creating Plan...' : 'Saving Changes...'}
              </>
            ) : mode === 'create' ? (
              <>
                <Plus className="size-3.5" />
                Create Plan
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function PlanFormModal(props: PlanFormModalProps) {
  const { isOpen, mode, plan, isPending, onClose } = props;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FF4500]/10 text-[#FF4500]">
              <Layers className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold sm:text-xl">
                {mode === 'create' ? 'Create Subscription Plan' : `Edit Plan: ${plan?.name}`}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {mode === 'create'
                  ? 'Define pricing, usage quotas, feature benefits, and billing schedules.'
                  : 'Update plan parameters, benefits, pricing, and availability.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOpen && <PlanFormContent key={`${mode}-${plan?.id ?? 'new'}`} {...props} />}
      </DialogContent>
    </Dialog>
  );
}
