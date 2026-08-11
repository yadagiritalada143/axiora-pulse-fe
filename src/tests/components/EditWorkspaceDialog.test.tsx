import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditWorkspaceDialog } from '@features/workspace/components/EditWorkspaceDialog';
import { useUpdateWorkspace } from '@features/workspace/hooks/useWorkspaces';
import type { Workspace } from '@features/workspace/types';

jest.mock('@features/workspace/hooks/useWorkspaces', () => ({
  useUpdateWorkspace: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockedUseUpdateWorkspace = useUpdateWorkspace as jest.Mock;

const workspace: Workspace = {
  id: 7,
  user_id: 1,
  name: 'Rocket Idea',
  description: 'A rocket delivery idea',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('EditWorkspaceDialog', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not render dialog content when closed', () => {
    mockedUseUpdateWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<EditWorkspaceDialog open={false} workspace={workspace} onOpenChange={jest.fn()} />);

    expect(screen.queryByText('Edit Workspace')).not.toBeInTheDocument();
  });

  it('pre-fills the form with the workspace name and description', () => {
    mockedUseUpdateWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<EditWorkspaceDialog open workspace={workspace} onOpenChange={jest.fn()} />);

    expect(screen.getByLabelText('Workspace Name')).toHaveValue('Rocket Idea');
    expect(screen.getByLabelText('Description')).toHaveValue('A rocket delivery idea');
  });

  it('disables the save button when the name is cleared', async () => {
    const user = userEvent.setup();
    mockedUseUpdateWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<EditWorkspaceDialog open workspace={workspace} onOpenChange={jest.fn()} />);

    const nameInput = screen.getByLabelText('Workspace Name');
    await user.clear(nameInput);

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('does not call mutate when there is no workspace to edit', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockedUseUpdateWorkspace.mockReturnValue({ mutate, isPending: false });

    render(<EditWorkspaceDialog open workspace={null} onOpenChange={jest.fn()} />);

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    expect(saveButton).toBeDisabled();

    await user.click(saveButton);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('does not call mutate when clicked with a name but no workspace to save (defensive guard)', async () => {
    // The name field has no `workspace`-based disabled state of its own, so a user can type a
    // name even with `workspace={null}` - this exercises the `!workspace` early-return branch of
    // `handleSave` (as opposed to the test above, where the button itself stays disabled).
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockedUseUpdateWorkspace.mockReturnValue({ mutate, isPending: false });

    render(<EditWorkspaceDialog open workspace={null} onOpenChange={jest.fn()} />);

    await user.type(screen.getByLabelText('Workspace Name'), 'Untethered name');

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('submits the trimmed name and description and closes the dialog on success', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const mutate = jest.fn(
      (
        _values: { id: number; payload: { name: string; description: string } },
        options?: { onSuccess?: () => void },
      ) => {
        options?.onSuccess?.();
      },
    );
    mockedUseUpdateWorkspace.mockReturnValue({ mutate, isPending: false });

    render(<EditWorkspaceDialog open workspace={workspace} onOpenChange={onOpenChange} />);

    const nameInput = screen.getByLabelText('Workspace Name');
    await user.clear(nameInput);
    await user.type(nameInput, '  Renamed Rocket  ');

    const descriptionInput = screen.getByLabelText('Description');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, '  Updated description  ');

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          id: 7,
          payload: { name: 'Renamed Rocket', description: 'Updated description' },
        },
        expect.objectContaining({ onSuccess: expect.any(Function) as unknown }),
      ),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    mockedUseUpdateWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<EditWorkspaceDialog open workspace={workspace} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables the buttons and shows a pending label while saving', () => {
    mockedUseUpdateWorkspace.mockReturnValue({ mutate: jest.fn(), isPending: true });

    render(<EditWorkspaceDialog open workspace={workspace} onOpenChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
