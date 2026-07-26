import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { NotFound } from '@components/common/NotFound';

describe('NotFound', () => {
  it('renders the 404 heading and a link back home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Back to home' });
    expect(link).toHaveAttribute('href', '/');
  });
});
