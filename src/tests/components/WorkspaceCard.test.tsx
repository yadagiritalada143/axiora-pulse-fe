import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WorkspaceCard } from '@features/workspace/components/WorkspaceCard';
import type { Workspace } from '@features/workspace/types';

const workspace: Workspace = {
  id: 42,
  user_id: 1,
  name: 'Rocket Idea',
  description: 'A workspace for the rocket idea',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-05T00:00:00.000Z',
};

describe('WorkspaceCard', () => {
  it('falls back to created_at and a generic label when updated_at is empty or invalid', () => {
    render(
      <WorkspaceCard
        workspace={{ ...workspace, updated_at: '', created_at: 'not-a-real-date' }}
        onClick={jest.fn()}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />,
    );

    expect(screen.getByText('Recently updated')).toBeInTheDocument();
  });

  it('renders the workspace name and description', () => {
    render(
      <WorkspaceCard
        workspace={workspace}
        onClick={jest.fn()}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />,
    );

    expect(screen.getByText('Rocket Idea')).toBeInTheDocument();
    expect(screen.getByText('A workspace for the rocket idea')).toBeInTheDocument();
  });

  it('renders a fallback when there is no description', () => {
    render(
      <WorkspaceCard
        workspace={{ ...workspace, description: '' }}
        onClick={jest.fn()}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />,
    );

    expect(screen.getByText('No description provided.')).toBeInTheDocument();
  });

  it('calls onClick with the workspace id when clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <WorkspaceCard
        workspace={workspace}
        onClick={onClick}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />,
    );

    await user.click(screen.getByText('Rocket Idea'));

    expect(onClick).toHaveBeenCalledWith(42);
  });

  it('calls onClick when Enter is pressed on the card', () => {
    const onClick = jest.fn();

    render(
      <WorkspaceCard
        workspace={workspace}
        onClick={onClick}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />,
    );

    const card = screen.getByText('Rocket Idea').closest('[role="button"]');
    expect(card).not.toBeNull();

    if (card) {
      fireEvent.keyDown(card, { key: 'Enter' });
    }

    expect(onClick).toHaveBeenCalledWith(42);
  });

  it('calls onDelete with the workspace id when the delete menu item is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    render(
      <WorkspaceCard
        workspace={workspace}
        onClick={jest.fn()}
        onDelete={onDelete}
        onEdit={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));
    await user.click(await screen.findByText('Delete'));

    expect(onDelete).toHaveBeenCalledWith(42);
  });

  it('calls onEdit with the workspace id when the edit menu item is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    render(
      <WorkspaceCard
        workspace={workspace}
        onClick={jest.fn()}
        onDelete={jest.fn()}
        onEdit={onEdit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));
    await user.click(await screen.findByText('Edit'));

    expect(onEdit).toHaveBeenCalledWith(42);
  });

  it('does not propagate clicks on the dropdown content area itself to the card', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <WorkspaceCard
        workspace={workspace}
        onClick={onClick}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));
    const menu = await screen.findByRole('menu');
    await user.click(menu);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick when Space is pressed on the card', () => {
    const onClick = jest.fn();

    render(
      <WorkspaceCard
        workspace={workspace}
        onClick={onClick}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />,
    );

    const card = screen.getByText('Rocket Idea').closest('[role="button"]');
    expect(card).not.toBeNull();

    if (card) {
      fireEvent.keyDown(card, { key: ' ' });
    }

    expect(onClick).toHaveBeenCalledWith(42);
  });

  it('does not trigger onClick for unrelated key presses', () => {
    const onClick = jest.fn();

    render(
      <WorkspaceCard
        workspace={workspace}
        onClick={onClick}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />,
    );

    const card = screen.getByText('Rocket Idea').closest('[role="button"]');
    expect(card).not.toBeNull();

    if (card) {
      fireEvent.keyDown(card, { key: 'Tab' });
    }

    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not trigger onClick when opening the actions menu', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <WorkspaceCard
        workspace={workspace}
        onClick={onClick}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Workspace actions' }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
