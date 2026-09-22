import { formatStorageSize, generatePlanFeatures, isFreePlan } from '@/utils/planFeatures';

describe('planFeatures utility', () => {
  describe('isFreePlan', () => {
    it('identifies free plans by price', () => {
      expect(isFreePlan({ price_monthly: 0 })).toBe(true);
      expect(isFreePlan({ priceMonthly: 0 })).toBe(true);
    });

    it('identifies free plans by code or name', () => {
      expect(isFreePlan({ code: 'starter' })).toBe(true);
      expect(isFreePlan({ name: 'Starter' })).toBe(true);
      expect(isFreePlan({ code: 'free' })).toBe(true);
    });

    it('returns false for paid plans', () => {
      expect(isFreePlan({ price_monthly: 499, code: 'builder' })).toBe(false);
      expect(isFreePlan({ priceMonthly: 999, name: 'Pro' })).toBe(false);
    });

    it('handles null/undefined gracefully', () => {
      expect(isFreePlan(null)).toBe(true);
      expect(isFreePlan(undefined)).toBe(true);
    });
  });

  describe('formatStorageSize', () => {
    it('formats MB sizes below 1024', () => {
      expect(formatStorageSize(200)).toBe('200 MB');
      expect(formatStorageSize(500)).toBe('500 MB');
    });

    it('formats GB sizes at or above 1024', () => {
      expect(formatStorageSize(1024)).toBe('1 GB');
      expect(formatStorageSize(2048)).toBe('2 GB');
      expect(formatStorageSize(5120)).toBe('5 GB');
    });

    it('defaults to 200 MB when null/undefined/0', () => {
      expect(formatStorageSize(null)).toBe('200 MB');
      expect(formatStorageSize(undefined)).toBe('200 MB');
      expect(formatStorageSize(0)).toBe('200 MB');
    });
  });

  describe('generatePlanFeatures', () => {
    it('generates correct bullet points for Starter (free) plan matching reference design', () => {
      const starterPlan = {
        code: 'starter',
        name: 'Starter',
        price_monthly: 0,
        workspace_limit: 1,
        regeneration_limit: 2,
        stage_rerun: 1,
        survey_analytics: 'Basic',
        survey_response_cap: 100,
        export_enabled: false,
        storage_limit: 200,
      };

      const features = generatePlanFeatures(starterPlan);

      expect(features).toEqual([
        '1 workspace/idea for 7 days',
        '2 survey regenerations per workspace',
        '1 stage rerun per workspace',
        'Basic survey analytics',
        '100 survey responses per workspace',
        '200 MB storage',
      ]);
    });

    it('never includes "Export validation reports" for Starter even if export_enabled is true', () => {
      const starterWithExport = {
        code: 'starter',
        name: 'Starter',
        price_monthly: 0,
        workspace_limit: 1,
        regeneration_limit: 2,
        stage_rerun: 1,
        survey_analytics: 'Basic',
        survey_response_cap: 100,
        export_enabled: true,
        storage_limit: 200,
      };

      const features = generatePlanFeatures(starterWithExport);
      expect(features).not.toContain('Export validation reports');
    });

    it('generates correct bullet points for Builder plan matching reference design', () => {
      const builderPlan = {
        code: 'builder',
        name: 'Builder',
        price_monthly: 499,
        workspace_limit: 3,
        regeneration_limit: 5,
        stage_rerun: 3,
        survey_analytics: 'Advanced',
        survey_response_cap: 500,
        export_enabled: true,
        storage_limit: 500,
      };

      const features = generatePlanFeatures(builderPlan);

      expect(features).toEqual([
        '3 workspaces/ideas',
        '5 survey regenerations per workspace',
        '3 stage reruns per workspace',
        'Advanced survey analytics',
        '500 survey responses per workspace',
        'Export validation reports',
        '500 MB storage',
      ]);
    });

    it('generates correct bullet points for Pro plan matching reference design', () => {
      const proPlan = {
        code: 'pro',
        name: 'Pro',
        price_monthly: 999,
        workspace_limit: 10,
        regeneration_limit: 10,
        stage_rerun: 5,
        survey_analytics: 'Advanced',
        survey_response_cap: 2000,
        export_enabled: true,
        storage_limit: 2048,
      };

      const features = generatePlanFeatures(proPlan);

      expect(features).toEqual([
        '10 workspaces/ideas',
        '10 survey regenerations per workspace',
        '5 stage reruns per workspace',
        'Advanced survey analytics',
        '2,000 survey responses per workspace',
        'Export validation reports',
        '2 GB storage',
      ]);
    });
  });
});
