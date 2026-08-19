import type { ID, Timestamps } from '@/types/common.types';
import type { Role } from '@constants/roles';

export interface User extends Timestamps {
  id: ID;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Workspace extends Timestamps {
  id: ID;
  name: string;
  ownerId: ID;
}

export interface PricingPlan {
  id: ID;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  /** Short tagline shown under the price (backend `Plan.description`). */
  description?: string | null;
  /** Whether this plan is visually highlighted as the recommended tier. */
  popular?: boolean;
}
