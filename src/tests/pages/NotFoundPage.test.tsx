import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import NotFoundPage from '@pages/NotFoundPage';

describe('NotFoundPage', () => {
  it('renders a 404 message with a link back home', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toBeInTheDocument();
  });
});
