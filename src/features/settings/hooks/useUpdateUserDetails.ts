import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { UpdateUserDetailsPayload, UserDetails } from '@/types/api.types';
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
      const fullName = [updatedDetails.first_name, updatedDetails.last_name]
        .filter(Boolean)
        .join(' ');
      updateUser({
        firstName: updatedDetails.first_name,
        lastName: updatedDetails.last_name,
        name: fullName,
        mobileNumber: updatedDetails.mobile_number,
        dateOfBirth: updatedDetails.date_of_birth,
        gender: updatedDetails.gender,
        nationality: updatedDetails.nationality,
        profileStatus: updatedDetails.profile_status,
        communicationPreferences: updatedDetails.communication_preferences,
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
