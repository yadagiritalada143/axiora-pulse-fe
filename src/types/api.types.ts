import type { ID, Timestamps } from '@/types/common.types';
import type { Role } from '@constants/roles';

export interface User extends Timestamps {
  id: ID;
  email: string;
  name: string;
  avatarUrl: string | null;
  avatar_url?: string | null;
  role: Role;
  profileId?: string | null;
  profile_id?: string | null;
  firstName?: string | null;
  first_name?: string | null;
  lastName?: string | null;
  last_name?: string | null;
  mobileNumber?: string | null;
  mobile_number?: string | null;
  dateOfBirth?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  profileStatus?: string | null;
  profile_status?: string | null;
  nationality?: string | null;
  communicationPreferences?: string[] | null;
  communication_preferences?: string[] | null;
  lastLoginDate?: string | null;
  last_login_date?: string | null;
}

export interface UserDetails {
  profile_id: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  profile_status: string;
  nationality?: string | null;
  communication_preferences: string[];
  last_login_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserDetailsPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile_number?: string;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  communication_preferences?: ('Email' | 'SMS' | 'Push')[];
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
  code?: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  price_monthly?: number;
  price_yearly?: number;
  old_price?: number | null;
  oldPrice?: number | null;
  currency?: string;
  features: string[];
  description?: string | null;
  popular?: boolean;
  tier?: number;
  workspace_limit?: number | null;
  survey_response_cap?: number | null;
  regeneration_limit?: number | null;
  export_enabled?: boolean;
  stage_rerun?: number | null;
  survey_analytics?: string;
  storage_limit?: number | null;
  is_active?: boolean;
}
