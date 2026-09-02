import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { contactService } from '../api/contact.service';
import type { ContactRequest, ContactResponse } from '../types/contact.types';

export function useSubmitContact() {
  return useMutation<ContactResponse, Error, ContactRequest>({
    mutationFn: (payload) => contactService.submitContact(payload),
    onSuccess: (data) => {
      toast.success(
        data.message ?? 'Thank you! Your message has been sent. We will get back to you shortly.',
      );
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string; detail?: string } };
        message?: string;
      };
      const errorMsg =
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        err?.message ??
        'Failed to send message. Please try again later.';
      toast.error(errorMsg);
    },
  });
}
