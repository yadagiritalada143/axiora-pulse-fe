import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppBreadcrumb } from '@components/common/AppBreadcrumb';

describe('AppBreadcrumb', () => {
  it('renders intermediate items as links and the last item as the current page', () => {
    render(
      <MemoryRouter>
        <AppBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Workspace', href: '/workspace' },
            { label: 'Details' },
          ]}
        />
      </MemoryRouter>,
    );

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/');

    const workspaceLink = screen.getByRole('link', { name: 'Workspace' });
    expect(workspaceLink).toHaveAttribute('href', '/workspace');

    const lastItem = screen.getByText('Details');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
    expect(lastItem).not.toHaveAttribute('href');
  });

  it('renders an item without an href as plain text even if not last', () => {
    render(
      <MemoryRouter>
        <AppBreadcrumb items={[{ label: 'No Link' }, { label: 'Last' }]} />
      </MemoryRouter>,
    );

    expect(screen.getByText('No Link')).not.toHaveAttribute('href');
    expect(screen.getByText('Last')).toHaveAttribute('aria-current', 'page');
  });
});
