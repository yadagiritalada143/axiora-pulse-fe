import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateWorkspaceDialog } from '@features/workspace/components/CreateWorkspaceDialog';
import { useCreateWorkspace } from '@features/workspace/hooks/useWorkspaces';

jest.mock('@features/workspace/hooks/useWorkspaces', () => ({
  useCreateWorkspace: jest.fn(),
}));

const mockedUseCreateWorkspace = useCreateWorkspace as jest.Mock;

beforeAll(() => {
  Element.prototype.hasPointerCapture = jest.fn();
  Element.prototype.setPointerCapture = jest.fn();
  Element.prototype.releasePointerCapture = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});

describe('CreateWorkspaceDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseCreateWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  it('renders the form when open', () => {
    render(<CreateWorkspaceDialog open onOpenChange={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Create Workspace' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter workspace name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter description (optional)')).toBeInTheDocument();
  });

  it('shows a pending state while the mutation is in flight', () => {
    mockedUseCreateWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: true });

    render(<CreateWorkspaceDialog open onOpenChange={jest.fn()} />);

    const submit = screen.getByRole('button', { name: /creating/i });
    expect(submit).toBeDisabled();
  });

  it('closes when Cancel is clicked', async () => {
    const onOpenChange = jest.fn();
    render(<CreateWorkspaceDialog open onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('blocks submission and shows an error when the name is empty', async () => {
    const mutate = jest.fn();
    mockedUseCreateWorkspace.mockReturnValue({ mutate, isPending: false });
    render(<CreateWorkspaceDialog open onOpenChange={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Create Workspace' }));

    expect(await screen.findByText('Workspace name is required')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('submits a valid workspace and closes on success', async () => {
    const onOpenChange = jest.fn();
    const mutate = jest.fn((_values: unknown, options?: { onSuccess?: () => void }) =>
      options?.onSuccess?.(),
    );
    mockedUseCreateWorkspace.mockReturnValue({ mutate, isPending: false });

    render(<CreateWorkspaceDialog open onOpenChange={onOpenChange} />);

    await userEvent.type(screen.getByPlaceholderText('Enter workspace name'), 'My Workspace');
    await userEvent.type(
      screen.getByPlaceholderText('Enter description (optional)'),
      'A description',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create Workspace' }));

    const onSuccessMatcher: unknown = expect.any(Function);
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { name: 'My Workspace', description: 'A description' },
        expect.objectContaining({ onSuccess: onSuccessMatcher }),
      ),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
