import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { toast } from 'sonner';

import { contactService } from '@features/landing/api/contact.service';
import { useSubmitContact } from '@features/landing/hooks/useSubmitContact';

jest.mock('@features/landing/api/contact.service', () => ({
  contactService: {
    submitContact: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedContactService = jest.mocked(contactService);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useSubmitContact', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows success toast with returned message', async () => {
    mockedContactService.submitContact.mockResolvedValue({
      success: true,
      message: 'Message received!',
    });

    const payload = { name: 'A', email: 'a@b.com', topic: 'general', message: 'hello' };
    const { result } = renderHook(() => useSubmitContact(), { wrapper: createWrapper() });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedContactService.submitContact).toHaveBeenCalledWith(payload);
    expect(toast.success).toHaveBeenCalledWith('Message received!');
  });

  it('shows default success toast when no message present', async () => {
    mockedContactService.submitContact.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useSubmitContact(), { wrapper: createWrapper() });

    result.current.mutate({ name: 'A', email: 'a@b.com', topic: 'general', message: 'hello' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith(
      'Thank you! Your message has been sent. We will get back to you shortly.',
    );
  });

  it('shows error message from api response', async () => {
    mockedContactService.submitContact.mockRejectedValue({
      response: { data: { message: 'Rate limited' } },
    });

    const { result } = renderHook(() => useSubmitContact(), { wrapper: createWrapper() });

    result.current.mutate({ name: 'A', email: 'a@b.com', topic: 'general', message: 'hello' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Rate limited');
  });

  it('shows fallback error message', async () => {
    mockedContactService.submitContact.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useSubmitContact(), { wrapper: createWrapper() });

    result.current.mutate({ name: 'A', email: 'a@b.com', topic: 'general', message: 'hello' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('network down');
  });
});
