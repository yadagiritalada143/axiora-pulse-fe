import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { User } from '@/types/api.types';
import { GuestRoute } from '@app/router/GuestRoute';
import { HomeRedirect } from '@app/router/HomeRedirect';
import { ProtectedRoute } from '@app/router/ProtectedRoute';
import { RoleRoute } from '@app/router/RoleRoute';
import type { Role } from '@constants/roles';
import { useAuthStore } from '@store/auth.store';

function makeUser(role: Role): User {
  return {
    id: '1',
    email: 'e@example.com',
    name: 'Test',
    avatarUrl: null,
    role,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function setAuth(partial: Partial<ReturnType<typeof useAuthStore.getState>>) {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    onboardingPending: false,
    hasActivePlan: false,
    ...partial,
  });
}

describe('ProtectedRoute', () => {
  function renderAt() {
    return render(
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/secret" element={<div>secret</div>} />
          </Route>
          <Route path="/login" element={<div>login-page</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('redirects to login when not authenticated', () => {
    setAuth({ isAuthenticated: false });
    renderAt();
    expect(screen.getByText('login-page')).toBeInTheDocument();
  });

  it('renders the outlet when authenticated', () => {
    setAuth({ isAuthenticated: true });
    renderAt();
    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});

describe('GuestRoute', () => {
  function renderAt() {
    return render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<div>guest-content</div>} />
          </Route>
          <Route path="/dashboard" element={<div>dashboard</div>} />
          <Route path="/pricing" element={<div>pricing</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('renders guest content when not authenticated', () => {
    setAuth({ isAuthenticated: false });
    renderAt();
    expect(screen.getByText('guest-content')).toBeInTheDocument();
  });

  it('redirects to dashboard while onboarding is pending', () => {
    setAuth({ isAuthenticated: true, onboardingPending: true });
    renderAt();
    expect(screen.getByText('dashboard')).toBeInTheDocument();
  });

  it('redirects to dashboard with an active plan', () => {
    setAuth({ isAuthenticated: true, hasActivePlan: true });
    renderAt();
    expect(screen.getByText('dashboard')).toBeInTheDocument();
  });

  it('redirects to pricing without a plan', () => {
    setAuth({ isAuthenticated: true, hasActivePlan: false });
    renderAt();
    expect(screen.getByText('pricing')).toBeInTheDocument();
  });
});

describe('HomeRedirect', () => {
  function renderAt() {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<div>login</div>} />
          <Route path="/dashboard" element={<div>dashboard</div>} />
          <Route path="/pricing" element={<div>pricing</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('sends unauthenticated users to login', () => {
    setAuth({ isAuthenticated: false });
    renderAt();
    expect(screen.getByText('login')).toBeInTheDocument();
  });

  it('sends onboarding users to the dashboard', () => {
    setAuth({ isAuthenticated: true, onboardingPending: true });
    renderAt();
    expect(screen.getByText('dashboard')).toBeInTheDocument();
  });

  it('sends users without a plan to pricing', () => {
    setAuth({ isAuthenticated: true, hasActivePlan: false });
    renderAt();
    expect(screen.getByText('pricing')).toBeInTheDocument();
  });
});

describe('RoleRoute', () => {
  function renderAt() {
    return render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<RoleRoute minimumRole="admin" />}>
            <Route path="/admin" element={<div>admin-area</div>} />
          </Route>
          <Route path="/dashboard" element={<div>dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('redirects when there is no user', () => {
    setAuth({ user: null });
    renderAt();
    expect(screen.getByText('dashboard')).toBeInTheDocument();
  });

  it('redirects when the role is insufficient', () => {
    setAuth({ user: makeUser('member') });
    renderAt();
    expect(screen.getByText('dashboard')).toBeInTheDocument();
  });

  it('renders when the role meets the minimum', () => {
    setAuth({ user: makeUser('owner') });
    renderAt();
    expect(screen.getByText('admin-area')).toBeInTheDocument();
  });
});
