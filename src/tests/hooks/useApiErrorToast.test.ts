import { renderHook } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ROUTES } from '@constants/routes';
import { useApiErrorToast } from '@hooks/useApiErrorToast';

jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));
jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));

const mockedToastError = toast.error as jest.Mock;
const mockedUseNavigate = useNavigate as jest.Mock;

describe('useApiErrorToast', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    mockedUseNavigate.mockReturnValue(navigate);
    jest.clearAllMocks();
  });

  it('shows the backend message with an Upgrade action on 402, routing to pricing', () => {
    const { result } = renderHook(() => useApiErrorToast());
    result.current({
      message: "You've reached your workspace limit of 1.",
      status: 402,
      code: 'PAYMENT_REQUIRED',
    });

    expect(mockedToastError).toHaveBeenCalledWith(
      "You've reached your workspace limit of 1.",
      expect.objectContaining({ action: expect.objectContaining({ label: 'Upgrade' }) }),
    );

    // The Upgrade action navigates to pricing.
    const options = mockedToastError.mock.calls[0][1];
    options.action.onClick();
    expect(navigate).toHaveBeenCalledWith(ROUTES.PRICING);
  });

  it('shows a plain toast (no Upgrade) for a non-402 error like a 403', () => {
    const { result } = renderHook(() => useApiErrorToast());
    result.current({
      message: 'This survey is no longer accepting responses.',
      status: 403,
      code: 'FORBIDDEN',
    });

    expect(mockedToastError).toHaveBeenCalledWith('This survey is no longer accepting responses.');
  });

  it('uses the fallback message when the error carries none', () => {
    const { result } = renderHook(() => useApiErrorToast());
    result.current(undefined, 'Could not export. Please try again.');

    expect(mockedToastError).toHaveBeenCalledWith('Could not export. Please try again.');
  });
});
