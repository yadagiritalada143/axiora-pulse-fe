import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { MentorShell } from '@features/ideaValidation/components/MentorShell';

function renderShell() {
  return render(
    <MemoryRouter>
      <MentorShell>
        <p>Dashboard content</p>
      </MentorShell>
    </MemoryRouter>,
  );
}

describe('MentorShell', () => {
  it('renders its children alongside the Pulse wordmark', () => {
    renderShell();

    expect(screen.getByText('Pulse')).toBeInTheDocument();
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });

  it('opens and closes the mobile navigation via the menu toggle buttons', async () => {
    const user = userEvent.setup();
    renderShell();

    const nav = screen.getByRole('complementary');
    expect(nav.className).toContain('-translate-x-full');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(nav.className).toContain('translate-x-0');
    expect(nav.className).not.toContain('-translate-x-full');

    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(nav.className).toContain('-translate-x-full');
  });

  it('closes the mobile navigation when the overlay behind it is clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderShell();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const nav = screen.getByRole('complementary');
    expect(nav.className).toContain('translate-x-0');

    const overlay = container.querySelector('[aria-hidden="true"].fixed.inset-0');
    if (!(overlay instanceof HTMLElement)) {
      throw new Error('Expected the mobile nav overlay to be in the document');
    }
    await user.click(overlay);

    expect(nav.className).toContain('-translate-x-full');
  });
});
