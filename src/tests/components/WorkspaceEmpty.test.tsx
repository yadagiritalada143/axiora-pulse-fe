import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WorkspaceEmpty } from '@features/workspace/components/WorkspaceEmpty';

describe('WorkspaceEmpty', () => {
  it('renders the empty-state copy', () => {
    render(<WorkspaceEmpty onCreate={jest.fn()} />);

    expect(screen.getByText('No Workspaces Yet')).toBeInTheDocument();
    expect(
      screen.getByText('Create your first workspace to start using Axiora Pulse.'),
    ).toBeInTheDocument();
  });

  it('calls onCreate when the create button is clicked', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();

    render(<WorkspaceEmpty onCreate={onCreate} />);

    await user.click(screen.getByRole('button', { name: /create workspace/i }));

    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
