import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
  AdminPlan,
  AdminPlanListResponse,
  CreatePlanWithRazorpayPayload,
  UpdatePlanPayload,
} from '@/types/admin.types';
import { queryKeys } from '@constants/queryKeys';
import { adminService } from '@services/admin';

export function useAdminPlans(): UseQueryResult<AdminPlanListResponse, Error> {
  return useQuery<AdminPlanListResponse, Error>({
    queryKey: queryKeys.admin.plans(),
    queryFn: () => adminService.listPlans(),
  });
}

export function useAdminPlanDetail(planId: number): UseQueryResult<AdminPlan, Error> {
  return useQuery<AdminPlan, Error>({
    queryKey: queryKeys.admin.planDetail(planId),
    queryFn: () => adminService.getPlan(planId),
    enabled: planId > 0,
  });
}

export function useAdminCreatePlan(): UseMutationResult<
  AdminPlan,
  Error,
  CreatePlanWithRazorpayPayload
> {
  const queryClient = useQueryClient();

  return useMutation<AdminPlan, Error, CreatePlanWithRazorpayPayload>({
    mutationFn: (payload: CreatePlanWithRazorpayPayload) =>
      adminService.createPlanWithRazorpay(payload),
    onSuccess: (data) => {
      toast.success(`Plan "${data.name}" created successfully.`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.plans() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.plans() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.status() });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create plan.');
    },
  });
}

export function useAdminUpdatePlan(): UseMutationResult<
  AdminPlan,
  Error,
  { planId: number; payload: UpdatePlanPayload }
> {
  const queryClient = useQueryClient();

  return useMutation<AdminPlan, Error, { planId: number; payload: UpdatePlanPayload }>({
    mutationFn: ({ planId, payload }) => adminService.updatePlan(planId, payload),
    onSuccess: (data, variables) => {
      toast.success(`Plan "${data.name}" updated successfully.`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.plans() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.planDetail(variables.planId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.plans() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.status() });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update plan.');
    },
  });
}

export function useAdminTogglePlanStatus(): UseMutationResult<
  AdminPlan,
  Error,
  { planId: number; isActive: boolean }
> {
  const queryClient = useQueryClient();

  return useMutation<AdminPlan, Error, { planId: number; isActive: boolean }>({
    mutationFn: ({ planId, isActive }) => adminService.updatePlan(planId, { is_active: isActive }),
    onSuccess: (data) => {
      const statusLabel = data.is_active ? 'activated' : 'deactivated';
      toast.success(`Plan "${data.name}" ${statusLabel} successfully.`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.plans() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.planDetail(data.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.plans() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.status() });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update plan status.');
    },
  });
}
