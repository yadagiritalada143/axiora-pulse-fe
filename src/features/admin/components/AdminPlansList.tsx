import {
  AlertCircle,
  BarChart3,
  Check,
  CheckCircle2,
  Crown,
  Edit2,
  FileText,
  FolderKanban,
  HardDrive,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Power,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import type {
  AdminPlan,
  CreatePlanWithRazorpayPayload,
  UpdatePlanPayload,
} from '@/types/admin.types';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import {
  useAdminCreatePlan,
  useAdminPlans,
  useAdminTogglePlanStatus,
  useAdminUpdatePlan,
} from '@features/admin/hooks';
import { cn } from '@lib/utils';

import { PlanFormModal } from './PlanFormModal';
import { TogglePlanStatusDialog } from './TogglePlanStatusDialog';

export function AdminPlansList() {
  const { data, isLoading, isError, error, refetch } = useAdminPlans();
  const createPlanMutation = useAdminCreatePlan();
  const updatePlanMutation = useAdminUpdatePlan();
  const toggleStatusMutation = useAdminTogglePlanStatus();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<AdminPlan | null>(null);

  const [planToToggle, setPlanToToggle] = useState<AdminPlan | null>(null);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);

  const [expandedFeatures, setExpandedFeatures] = useState<Record<number, boolean>>({});

  const allPlans: AdminPlan[] = useMemo(() => data?.plans ?? [], [data?.plans]);

  const filteredPlans: AdminPlan[] = useMemo(() => {
    return allPlans.filter((plan: AdminPlan) => {
      const nameMatch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
      const codeMatch = plan.code.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = Boolean(plan.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSearch = nameMatch || codeMatch || descMatch;

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? plan.is_active
            : !plan.is_active;

      return matchesStatus && matchesSearch;
    });
  }, [allPlans, searchTerm, statusFilter]);

  const totalPlans = allPlans.length;
  const activePlansCount = allPlans.filter((p: AdminPlan) => p.is_active).length;
  const inactivePlansCount = allPlans.filter((p: AdminPlan) => !p.is_active).length;
  const popularPlan: AdminPlan | undefined =
    allPlans.find((p: AdminPlan) => p.popular) ?? allPlans.find((p: AdminPlan) => p.tier === 1);

  const handleOpenCreate = () => {
    setSelectedPlanForEdit(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (plan: AdminPlan) => {
    setSelectedPlanForEdit(plan);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleCreateSubmit = (payload: CreatePlanWithRazorpayPayload) => {
    createPlanMutation.mutate(payload, {
      onSuccess: () => {
        setIsFormModalOpen(false);
      },
    });
  };

  const handleUpdateSubmit = (planId: number, payload: UpdatePlanPayload) => {
    updatePlanMutation.mutate(
      { planId, payload },
      {
        onSuccess: () => {
          setIsFormModalOpen(false);
        },
      },
    );
  };

  const handleOpenToggleDialog = (plan: AdminPlan) => {
    setPlanToToggle(plan);
    setIsToggleDialogOpen(true);
  };

  const handleConfirmToggle = () => {
    if (!planToToggle) return;
    toggleStatusMutation.mutate(
      { planId: planToToggle.id, isActive: !planToToggle.is_active },
      {
        onSuccess: () => {
          setIsToggleDialogOpen(false);
          setPlanToToggle(null);
        },
      },
    );
  };

  const toggleFeatureExpand = (planId: number) => {
    setExpandedFeatures((prev) => ({ ...prev, [planId]: !prev[planId] }));
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Subscription Plans
            </h1>
            <Badge
              variant="outline"
              className="border-orange-500/30 bg-orange-500/10 text-xs font-semibold text-[#FF4500]"
            >
              Admin
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Manage membership tiers, pricing schedules, usage limits, feature benefits, and billing
            integrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleOpenCreate}
            className="h-9 gap-1.5 bg-[#FF4500] text-xs font-semibold text-white shadow-xs hover:bg-[#FF4500]/90"
          >
            <Plus className="size-4" />
            Create Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-2xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-[#FF4500]">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Total Plans</p>
              <p className="text-foreground text-2xl font-bold">{totalPlans}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Active (Public)</p>
              <p className="text-foreground text-2xl font-bold">{activePlansCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Power className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Inactive / Drafts</p>
              <p className="text-foreground text-2xl font-bold">{inactivePlansCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Crown className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs font-medium">Featured Plan</p>
              <p className="text-foreground truncate text-base font-bold">
                {popularPlan ? popularPlan.name : 'None'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-2xs">
        <CardContent className="flex flex-col gap-3.5 p-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute inset-y-0 left-3 my-auto size-4" />

            <Input
              placeholder="Search plans by name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Tabs
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as 'all' | 'active' | 'inactive')}
              className="w-auto"
            >
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs">
                  All ({totalPlans})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs">
                  Active ({activePlansCount})
                </TabsTrigger>
                <TabsTrigger value="inactive" className="text-xs">
                  Inactive ({inactivePlansCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="border-border bg-muted/40 flex items-center rounded-lg border p-0.5">
              <Button
                type="button"
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="size-8 p-0"
                title="Grid view"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                type="button"
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="size-8 p-0"
                title="Table view"
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3 py-12">
          <Loader2 className="size-8 animate-spin text-[#FF4500]" />
          <p className="text-muted-foreground text-sm">Loading subscription plans...</p>
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="text-destructive mx-auto size-8" />
          <p className="text-destructive mt-2 text-sm font-semibold">Failed to load plans.</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {error?.message ?? 'Could not connect to the plans service.'}
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
      ) : filteredPlans.length === 0 ? (
        <Card className="border-border p-12 text-center">
          <Layers className="text-muted-foreground mx-auto size-10 stroke-[1.5]" />
          <h3 className="text-foreground mt-3 text-base font-semibold">No plans found</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            {searchTerm || statusFilter !== 'all'
              ? 'Try clearing your search or status filter.'
              : 'Get started by creating your first subscription plan.'}
          </p>
          {searchTerm || statusFilter !== 'all' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="mt-4 gap-1.5 bg-[#FF4500] text-xs font-semibold text-white hover:bg-[#FF4500]/90"
            >
              <Plus className="size-3.5" /> Create Plan
            </Button>
          )}
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan: AdminPlan) => {
            const isFeaturesOpen = Boolean(expandedFeatures[plan.id]);
            const previewFeatures = isFeaturesOpen
              ? plan.features
              : (plan.features ?? []).slice(0, 4);

            return (
              <Card
                key={plan.id}
                className={cn(
                  'border-border/80 bg-card flex flex-col justify-between rounded-2xl shadow-xs transition-all duration-200 hover:shadow-md',
                  plan.popular && 'border-[#FF4500]/50 ring-1 ring-[#FF4500]/20',
                  !plan.is_active && 'opacity-75',
                )}
              >
                <div>
                  <CardHeader className="space-y-3 p-5 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="border-border border font-mono text-[10px] font-semibold"
                        >
                          Tier {plan.tier}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {plan.popular ? (
                          <Badge className="bg-[#FF4500] text-[10px] font-semibold text-white">
                            Popular
                          </Badge>
                        ) : null}

                        {plan.is_active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <span className="size-1.5 rounded-full bg-amber-500" /> Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <CardTitle className="text-foreground text-lg font-bold tracking-tight">
                        {plan.name}
                      </CardTitle>
                      {plan.description ? (
                        <p className="text-muted-foreground mt-1 line-clamp-2 min-h-[36px] text-xs leading-relaxed">
                          {plan.description}
                        </p>
                      ) : (
                        <p className="text-muted-foreground/60 mt-1 min-h-[36px] text-xs italic">
                          No description provided
                        </p>
                      )}
                    </div>

                    <div className="border-border/80 bg-muted/20 rounded-xl border p-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-foreground text-2xl font-black">
                            ₹{plan.price_monthly.toLocaleString('en-IN')}
                          </span>
                          <span className="text-muted-foreground ml-1 text-xs">/ month</span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          ₹{plan.price_yearly.toLocaleString('en-IN')} / yr
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 px-5 pt-0 pb-4">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="border-border/60 bg-muted/10 flex items-center gap-2 rounded-lg border p-2">
                        <FolderKanban className="size-3.5 shrink-0 text-[#FF4500]" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-[10px]">Workspaces</p>
                          <p className="text-foreground truncate font-semibold">
                            {plan.workspace_limit ?? 'Unlimited'}
                          </p>
                        </div>
                      </div>

                      <div className="border-border/60 bg-muted/10 flex items-center gap-2 rounded-lg border p-2">
                        <FileText className="size-3.5 shrink-0 text-blue-500" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-[10px]">Responses</p>
                          <p className="text-foreground truncate font-semibold">
                            {plan.survey_response_cap != null
                              ? plan.survey_response_cap.toLocaleString('en-IN')
                              : 'Unlimited'}
                          </p>
                        </div>
                      </div>

                      <div className="border-border/60 bg-muted/10 flex items-center gap-2 rounded-lg border p-2">
                        <HardDrive className="size-3.5 shrink-0 text-purple-500" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-[10px]">Storage</p>
                          <p className="text-foreground truncate font-semibold">
                            {plan.storage_limit != null ? `${plan.storage_limit} MB` : 'Unlimited'}
                          </p>
                        </div>
                      </div>

                      <div className="border-border/60 bg-muted/10 flex items-center gap-2 rounded-lg border p-2">
                        <BarChart3 className="size-3.5 shrink-0 text-emerald-500" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-[10px]">Analytics</p>
                          <p className="text-foreground truncate font-semibold">
                            {plan.survey_analytics}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">
                          Features ({plan.features?.length ?? 0})
                        </span>
                        {plan.features && plan.features.length > 4 ? (
                          <button
                            type="button"
                            onClick={() => toggleFeatureExpand(plan.id)}
                            className="cursor-pointer text-[11px] font-medium text-[#FF4500] hover:underline"
                          >
                            {isFeaturesOpen ? 'Show less' : `+${plan.features.length - 4} more`}
                          </button>
                        ) : null}
                      </div>

                      <ul className="space-y-1.5">
                        {previewFeatures.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <Check className="mt-0.5 size-3 shrink-0 stroke-[2.5] text-emerald-500" />
                            <span className="text-foreground/80 line-clamp-1 leading-snug">
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-border/60 bg-muted/20 space-y-1.5 rounded-lg border p-2.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Monthly Billing:</span>
                        <span className="text-foreground max-w-[160px] truncate font-mono font-medium">
                          {plan.razorpay_plan_id_monthly ??
                            (plan.price_monthly === 0 ? 'Free Plan' : 'Auto-synced')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Annual Billing:</span>
                        <span className="text-foreground max-w-[160px] truncate font-mono font-medium">
                          {plan.razorpay_plan_id_yearly ??
                            (plan.price_yearly === 0 ? 'Free Plan' : 'Auto-synced')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="border-border/60 bg-muted/10 flex items-center justify-between border-t p-3.5 sm:p-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenToggleDialog(plan)}
                    className={cn(
                      'h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-semibold',
                      plan.is_active
                        ? 'text-amber-600 hover:bg-amber-500/10 hover:text-amber-700'
                        : 'text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700',
                    )}
                  >
                    <Power className="size-3.5" />
                    {plan.is_active ? 'Deactivate' : 'Activate'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(plan)}
                    className="h-8 gap-1.5 border-[#FF4500]/40 px-3 text-xs font-semibold text-[#FF4500] hover:border-[#FF4500] hover:bg-[#FF4500]/10 hover:text-[#FF4500]"
                  >
                    <Edit2 className="size-3.5" />
                    Edit Plan
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-border bg-muted/40 text-muted-foreground border-b uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tier / Code</th>
                  <th className="px-4 py-3 font-semibold">Plan Name</th>
                  <th className="px-4 py-3 font-semibold">Monthly Price</th>
                  <th className="px-4 py-3 font-semibold">Yearly Price</th>
                  <th className="px-4 py-3 font-semibold">Quotas</th>
                  <th className="px-4 py-3 font-semibold">Features</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {filteredPlans.map((plan: AdminPlan) => (
                  <tr key={plan.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          T{plan.tier}
                        </Badge>
                        <span className="text-muted-foreground font-mono text-[11px]">
                          {plan.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground font-bold">{plan.name}</div>
                      {plan.popular ? (
                        <span className="py-0.2 inline-block rounded bg-[#FF4500]/10 px-1 text-[9px] font-semibold text-[#FF4500]">
                          Popular
                        </span>
                      ) : null}
                    </td>
                    <td className="text-foreground px-4 py-3 font-semibold">
                      ₹{plan.price_monthly.toLocaleString('en-IN')}
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      ₹{plan.price_yearly.toLocaleString('en-IN')}
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      <div>WS: {plan.workspace_limit ?? '∞'}</div>
                      <div>Resp: {plan.survey_response_cap ?? '∞'}</div>
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {plan.features?.length ?? 0} features
                    </td>
                    <td className="px-4 py-3">
                      {plan.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          <span className="size-1.5 rounded-full bg-amber-500" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenToggleDialog(plan)}
                          className={cn(
                            'h-8 px-2 text-xs font-semibold',
                            plan.is_active ? 'text-amber-600' : 'text-emerald-600',
                          )}
                        >
                          {plan.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(plan)}
                          className="h-8 px-2.5 text-xs font-semibold text-[#FF4500]"
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <PlanFormModal
        isOpen={isFormModalOpen}
        mode={formMode}
        plan={selectedPlanForEdit}
        isPending={createPlanMutation.isPending || updatePlanMutation.isPending}
        onClose={() => setIsFormModalOpen(false)}
        onCreate={handleCreateSubmit}
        onUpdate={handleUpdateSubmit}
      />

      <TogglePlanStatusDialog
        isOpen={isToggleDialogOpen}
        plan={planToToggle}
        isPending={toggleStatusMutation.isPending}
        onClose={() => {
          setIsToggleDialogOpen(false);
          setPlanToToggle(null);
        }}
        onConfirm={handleConfirmToggle}
      />
    </div>
  );
}
