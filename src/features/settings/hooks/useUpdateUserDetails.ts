import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { UpdateUserDetailsPayload, User, UserDetails } from '@/types/api.types';
import { isApiError } from '@/types/error.types';
import { queryKeys } from '@constants/queryKeys';
import { useAuthStore } from '@store/auth.store';

import { userService } from '../api/user.service';

export function useUpdateUserDetails() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (payload: UpdateUserDetailsPayload) => userService.updateUserDetails(payload),
    onSuccess: (updatedDetails: UserDetails) => {
      const firstName = updatedDetails.first_name?.trim() ?? '';
      const lastName = updatedDetails.last_name?.trim() ?? '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

      updateUser({
        firstName,
        first_name: firstName,
        lastName,
        last_name: lastName,
        name: fullName,
        mobileNumber: updatedDetails.mobile_number,
        mobile_number: updatedDetails.mobile_number,
        dateOfBirth: updatedDetails.date_of_birth,
        date_of_birth: updatedDetails.date_of_birth,
        gender: updatedDetails.gender,
        nationality: updatedDetails.nationality,
        profileStatus: updatedDetails.profile_status,
        profile_status: updatedDetails.profile_status,
        communicationPreferences: updatedDetails.communication_preferences,
        communication_preferences: updatedDetails.communication_preferences,
      });

      queryClient.setQueryData(queryKeys.user.details(), updatedDetails);

      queryClient.setQueryData<User>(queryKeys.user.profile(), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          firstName,
          first_name: firstName,
          lastName,
          last_name: lastName,
          name: fullName || prev.name,
          mobileNumber: updatedDetails.mobile_number,
          mobile_number: updatedDetails.mobile_number,
          dateOfBirth: updatedDetails.date_of_birth,
          date_of_birth: updatedDetails.date_of_birth,
          gender: updatedDetails.gender,
          nationality: updatedDetails.nationality,
          profileStatus: updatedDetails.profile_status,
          profile_status: updatedDetails.profile_status,
          communicationPreferences: updatedDetails.communication_preferences,
          communication_preferences: updatedDetails.communication_preferences,
        };
      });

      void queryClient.invalidateQueries({ queryKey: queryKeys.user.details() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      toast.success('Profile details updated successfully.');
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Failed to update profile details.');
    },
  });
}
