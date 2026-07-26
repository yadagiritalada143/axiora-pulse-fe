import { render, screen } from '@testing-library/react';

import { AuthProvider } from '@app/providers/AuthProvider';
import { authEvents } from '@services/api';
import { useAuthStore } from '@store/auth.store';

jest.mock('@store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

describe('AuthProvider', () => {
  const clearSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ clearSession }),
    );
  });

  it('renders its children', () => {
    render(
      <AuthProvider>
        <div>Child content</div>
      </AuthProvider>,
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('clears the session when a "session-expired" event is emitted', () => {
    render(
      <AuthProvider>
        <div>Child content</div>
      </AuthProvider>,
    );

    expect(clearSession).not.toHaveBeenCalled();

    authEvents.emit('session-expired');

    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes from the event on unmount', () => {
    const { unmount } = render(
      <AuthProvider>
        <div>Child content</div>
      </AuthProvider>,
    );

    unmount();
    authEvents.emit('session-expired');

    expect(clearSession).not.toHaveBeenCalled();
  });
});
