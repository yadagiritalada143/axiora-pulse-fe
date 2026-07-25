import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppBreadcrumb } from '@components/common/AppBreadcrumb';

describe('AppBreadcrumb', () => {
  it('renders links for intermediate items and a page for the last', () => {
    render(
      <MemoryRouter>
        <AppBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Workspace', href: '/workspace' },
            { label: 'Current' },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Workspace' })).toHaveAttribute('href', '/workspace');

    const current = screen.getByText('Current');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).not.toHaveAttribute('href');
  });
});
