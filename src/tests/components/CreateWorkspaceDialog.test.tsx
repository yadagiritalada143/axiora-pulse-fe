import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateWorkspaceDialog } from '@features/workspace/components/CreateWorkspaceDialog';
import { useCreateWorkspace } from '@features/workspace/hooks/useWorkspaces';

jest.mock('@features/workspace/hooks/useWorkspaces', () => ({
  useCreateWorkspace: jest.fn(),
}));

const mockedUseCreateWorkspace = useCreateWorkspace as jest.Mock;

describe('CreateWorkspaceDialog', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not render dialog content when closed', () => {
    mockedUseCreateWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<CreateWorkspaceDialog open={false} onOpenChange={jest.fn()} />);

    expect(screen.queryByText('Create Workspace')).not.toBeInTheDocument();
  });

  it('shows a validation error and does not call mutate when the name is blank', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockedUseCreateWorkspace.mockReturnValue({ mutate, isPending: false });

    render(<CreateWorkspaceDialog open onOpenChange={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Create Workspace' }));

    expect(await screen.findByText('Workspace name is required')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('submits the form values and closes the dialog on success', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const mutate = jest.fn(
      (_values: { name: string; description?: string }, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      },
    );
    mockedUseCreateWorkspace.mockReturnValue({ mutate, isPending: false });

    render(<CreateWorkspaceDialog open onOpenChange={onOpenChange} />);

    await user.type(screen.getByLabelText('Workspace Name'), 'My Workspace');
    await user.type(screen.getByLabelText('Description'), 'A cool idea');
    await user.click(screen.getByRole('button', { name: 'Create Workspace' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { name: 'My Workspace', description: 'A cool idea' },
        expect.objectContaining({ onSuccess: expect.any(Function) as unknown }),
      ),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    mockedUseCreateWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<CreateWorkspaceDialog open onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables the submit button and shows a pending label while creating', () => {
    mockedUseCreateWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: true });

    render(<CreateWorkspaceDialog open onOpenChange={jest.fn()} />);

    const submitButton = screen.getByRole('button', { name: 'Creating...' });
    expect(submitButton).toBeDisabled();
  });
});
