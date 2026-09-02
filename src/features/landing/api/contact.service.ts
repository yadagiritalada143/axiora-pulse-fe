import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

import type { ContactRequest, ContactResponse } from '../types/contact.types';

export const contactService = {
  async submitContact(payload: ContactRequest): Promise<ContactResponse> {
    const { data } = await apiClient.post<ContactResponse>(API_ENDPOINTS.CONTACT.SUBMIT, payload);
    return data;
  },
};
