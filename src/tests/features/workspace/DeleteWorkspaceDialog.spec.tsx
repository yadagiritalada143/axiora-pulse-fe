import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DeleteWorkspaceDialog } from '@features/workspace/components/DeleteWorkspaceDialog';

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

describe('DeleteWorkspaceDialog', () => {
  it('renders the workspace name when open', () => {
    render(
      <DeleteWorkspaceDialog
        open
        workspaceName="Alpha"
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Delete Workspace' })).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls onConfirm when the delete action is clicked', async () => {
    const onConfirm = jest.fn();
    render(
      <DeleteWorkspaceDialog
        open
        workspaceName="Alpha"
        onOpenChange={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state and disables the buttons', () => {
    render(
      <DeleteWorkspaceDialog
        open
        loading
        workspaceName="Alpha"
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('closes when Cancel is clicked', async () => {
    const onOpenChange = jest.fn();
    render(
      <DeleteWorkspaceDialog
        open
        workspaceName="Alpha"
        onOpenChange={onOpenChange}
        onConfirm={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
