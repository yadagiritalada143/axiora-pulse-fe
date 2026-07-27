import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AdminDashboardPage from '@pages/AdminDashboardPage';
import { useAuthStore } from '@store/auth.store';

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminDashboardPage />
    </MemoryRouter>,
  );
}

describe('AdminDashboardPage', () => {
  afterEach(() => {
    useAuthStore.setState({ user: null });
  });

  it('greets the admin by name and links to interactive questions', () => {
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        name: 'Ada',
        avatarUrl: null,
        role: 'admin' as never,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    renderPage();

    expect(screen.getByRole('heading', { name: /welcome back, ada\./i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /manage questions/i })).toHaveAttribute(
      'href',
      '/admin/interactive-questions',
    );
  });
});
