import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { AccountRole } from '@/types/common.types';
import { CtaBanner } from '@features/landing/components/CtaBanner';
import { FounderChallengesSection } from '@features/landing/components/FounderChallengesSection';
import { LandingHero } from '@features/landing/components/LandingHero';
import { useAuthStore } from '@store/auth.store';

function setAuth(isAuthenticated: boolean, role: AccountRole | null) {
  act(() => {
    useAuthStore.setState({ isAuthenticated, role });
  });
}

describe('LandingHero', () => {
  const initialAuthState = useAuthStore.getState();

  afterEach(() => {
    act(() => {
      useAuthStore.setState(initialAuthState, true);
    });
  });

  it('renders hero title and CTA', () => {
    setAuth(false, null);

    render(
      <MemoryRouter>
        <LandingHero />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Great Ideas Don/)).toBeInTheDocument();
    expect(screen.getByText('Try it for free')).toBeInTheDocument();
  });

  it('clicking Try it for free does not throw for guests', () => {
    setAuth(false, null);

    render(
      <MemoryRouter>
        <LandingHero />
      </MemoryRouter>,
    );

    expect(() => fireEvent.click(screen.getByText('Try it for free'))).not.toThrow();
  });
});

describe('CtaBanner', () => {
  const initialAuthState = useAuthStore.getState();

  afterEach(() => {
    act(() => {
      useAuthStore.setState(initialAuthState, true);
    });
  });

  it('renders heading and START NOW link for guests pointing to register', () => {
    setAuth(false, null);

    render(
      <MemoryRouter>
        <CtaBanner />
      </MemoryRouter>,
    );

    expect(screen.getByText('Why You Late?')).toBeInTheDocument();
    const startNow = screen.getByText('START NOW');
    expect(startNow.getAttribute('href')).toBe('/register');
  });

  it('renders START NOW link pointing to admin dashboard for admins', () => {
    setAuth(true, 'admin');

    render(
      <MemoryRouter>
        <CtaBanner />
      </MemoryRouter>,
    );

    const startNow = screen.getByText('START NOW');
    expect(startNow.getAttribute('href')).toBe('/admin/dashboard');
  });
});

describe('FounderChallengesSection', () => {
  const initialAuthState = useAuthStore.getState();

  afterEach(() => {
    act(() => {
      useAuthStore.setState(initialAuthState, true);
    });
  });

  it('renders all challenge items', () => {
    setAuth(false, null);

    render(
      <MemoryRouter>
        <FounderChallengesSection />
      </MemoryRouter>,
    );

    expect(screen.getByText(/The Critical Challenges/)).toBeInTheDocument();
    expect(screen.getByText(/Everyone told me it was a great idea/)).toBeInTheDocument();
    expect(screen.getByText(/I know I should validate my idea/)).toBeInTheDocument();
    expect(screen.getByText(/What if I'm building something nobody needs/)).toBeInTheDocument();
    expect(screen.getByText(/when investors ask about validation/)).toBeInTheDocument();
    expect(screen.getByText('Build Your Idea')).toBeInTheDocument();
  });

  it('clicking Build Your Idea does not throw', () => {
    setAuth(true, 'user');

    render(
      <MemoryRouter>
        <FounderChallengesSection />
      </MemoryRouter>,
    );

    expect(() => fireEvent.click(screen.getByText('Build Your Idea'))).not.toThrow();
  });

  it('clicking Learn more does not throw', () => {
    setAuth(true, 'user');

    render(
      <MemoryRouter>
        <FounderChallengesSection />
      </MemoryRouter>,
    );

    const learnMore = screen.getByText('Learn more').closest('a');
    expect(learnMore).not.toBeNull();
    if (learnMore) {
      expect(() => fireEvent.click(learnMore)).not.toThrow();
    }
  });
});
