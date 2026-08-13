import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ArchivedWorkspaceCard } from '@features/workspace/components/ArchivedWorkspaceCard';
import type { Workspace } from '@features/workspace/types';

const workspace: Workspace = {
  id: 3,
  user_id: 1,
  name: 'Shelved Idea',
  description: 'An idea that was shelved',
  is_delete: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
};

function renderCard(props: Partial<React.ComponentProps<typeof ArchivedWorkspaceCard>> = {}) {
  const onRestore = jest.fn();
  const onDeletePermanent = jest.fn();

  render(
    <ArchivedWorkspaceCard
      workspace={workspace}
      onRestore={onRestore}
      onDeletePermanent={onDeletePermanent}
      {...props}
    />,
  );

  return { onRestore, onDeletePermanent };
}

describe('ArchivedWorkspaceCard', () => {
  it('renders the workspace name, description and archived timestamp', () => {
    renderCard();

    expect(screen.getByText('Shelved Idea')).toBeInTheDocument();
    expect(screen.getByText('An idea that was shelved')).toBeInTheDocument();
    expect(screen.getByText(/^Archived /)).toBeInTheDocument();
  });

  it('shows generic archived copy when the timestamp cannot be formatted', () => {
    renderCard({ workspace: { ...workspace, updated_at: '', created_at: '' } });

    expect(screen.getByText('Archived recently')).toBeInTheDocument();
  });

  it('falls back to placeholder copy when the workspace has no description', () => {
    renderCard({ workspace: { ...workspace, description: '' } });

    expect(screen.getByText('No description provided.')).toBeInTheDocument();
  });

  it('falls back to the created date when the workspace has never been updated', () => {
    renderCard({
      workspace: { ...workspace, updated_at: undefined as unknown as string },
    });

    expect(screen.getByText(/^Archived /)).toBeInTheDocument();
  });

  it('calls onRestore with the workspace id from the actions menu', async () => {
    const user = userEvent.setup();
    const { onRestore } = renderCard();

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));
    await user.click(await screen.findByText('Restore'));

    expect(onRestore).toHaveBeenCalledWith(3);
  });

  it('calls onDeletePermanent with the workspace id from the actions menu', async () => {
    const user = userEvent.setup();
    const { onDeletePermanent } = renderCard();

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));
    await user.click(await screen.findByText('Delete Permanently'));

    expect(onDeletePermanent).toHaveBeenCalledWith(3);
  });

  it('shows restoring copy and disables both actions while restoring', async () => {
    const user = userEvent.setup();
    renderCard({ isRestoring: true });

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));

    expect(await screen.findByText('Restoring…')).toBeInTheDocument();
    expect(screen.queryByText('Restore')).not.toBeInTheDocument();
    for (const item of screen.getAllByRole('menuitem')) {
      expect(item).toHaveAttribute('aria-disabled', 'true');
    }
  });

  it('disables the actions while a permanent delete is in flight', async () => {
    const user = userEvent.setup();
    renderCard({ isDeleting: true });

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));

    await screen.findByText('Delete Permanently');
    for (const item of screen.getAllByRole('menuitem')) {
      expect(item).toHaveAttribute('aria-disabled', 'true');
    }
  });
});
