import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WorkspaceCard } from '@features/workspace/components/WorkspaceCard';
import type { Workspace } from '@features/workspace/types';

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

const baseWorkspace: Workspace = {
  id: 42,
  user_id: 1,
  name: 'Alpha Workspace',
  description: 'The alpha workspace',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
};

function renderCard(overrides: Partial<Workspace> = {}, handlers = {}) {
  const onClick = jest.fn();
  const onDelete = jest.fn();
  render(
    <WorkspaceCard
      workspace={{ ...baseWorkspace, ...overrides }}
      onClick={onClick}
      onDelete={onDelete}
      {...handlers}
    />,
  );
  return { onClick, onDelete };
}

describe('WorkspaceCard', () => {
  it('renders the name and description', () => {
    renderCard();

    expect(screen.getByText('Alpha Workspace')).toBeInTheDocument();
    expect(screen.getByText('The alpha workspace')).toBeInTheDocument();
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });

  it('renders a fallback when there is no description', () => {
    renderCard({ description: '' });

    expect(screen.getByText('No description provided.')).toBeInTheDocument();
  });

  it('shows "Recently updated" when timestamps are missing', () => {
    renderCard({ created_at: '', updated_at: '' });

    expect(screen.getByText('Recently updated')).toBeInTheDocument();
  });

  it('calls onClick when the card is clicked', async () => {
    const { onClick } = renderCard();

    await userEvent.click(screen.getByRole('button', { name: /alpha workspace/i }));

    expect(onClick).toHaveBeenCalledWith(42);
  });

  it('activates on the Enter key', () => {
    const { onClick } = renderCard();

    fireEvent.keyDown(screen.getByRole('button', { name: /alpha workspace/i }), {
      key: 'Enter',
    });

    expect(onClick).toHaveBeenCalledWith(42);
  });

  it('activates on the Space key', () => {
    const { onClick } = renderCard();

    fireEvent.keyDown(screen.getByRole('button', { name: /alpha workspace/i }), {
      key: ' ',
    });

    expect(onClick).toHaveBeenCalledWith(42);
  });

  it('ignores other keys', () => {
    const { onClick } = renderCard();

    fireEvent.keyDown(screen.getByRole('button', { name: /alpha workspace/i }), {
      key: 'a',
    });

    expect(onClick).not.toHaveBeenCalled();
  });

  it('opens the menu and deletes without triggering the card click', async () => {
    const user = userEvent.setup();
    const { onClick, onDelete } = renderCard();

    await user.click(screen.getByRole('button', { name: /workspace actions/i }));
    await user.click(await screen.findByRole('menuitem', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith(42);
    expect(onClick).not.toHaveBeenCalled();
  });
});
