import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DeleteWorkspaceDialog } from '@features/workspace/components/DeleteWorkspaceDialog';

describe('DeleteWorkspaceDialog', () => {
  it('does not render when closed', () => {
    render(
      <DeleteWorkspaceDialog
        open={false}
        workspaceName="Rocket Idea"
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.queryByText('Archive Workspace')).not.toBeInTheDocument();
  });

  it('renders the workspace name in the confirmation copy', () => {
    render(
      <DeleteWorkspaceDialog
        open
        workspaceName="Rocket Idea"
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByText('Archive Workspace')).toBeInTheDocument();
    expect(screen.getByText('Rocket Idea')).toBeInTheDocument();
  });

  it('calls onConfirm when the delete action is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();

    render(
      <DeleteWorkspaceDialog
        open
        workspaceName="Rocket Idea"
        onOpenChange={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Move to Archive' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('closes via onOpenChange when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    render(
      <DeleteWorkspaceDialog
        open
        workspaceName="Rocket Idea"
        onOpenChange={onOpenChange}
        onConfirm={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows a pending label and disables the actions while loading', () => {
    render(
      <DeleteWorkspaceDialog
        open
        loading
        workspaceName="Rocket Idea"
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Archiving...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
