import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { AccountRole } from '@/types/common.types';
import { AboutSection } from '@features/landing/components/AboutSection';
import { AIMentorSection } from '@features/landing/components/AIMentorSection';
import { StartupJourneySection } from '@features/landing/components/StartupJourneySection';
import { TestimonialsSection } from '@features/landing/components/TestimonialsSection';
import { useAuthStore } from '@store/auth.store';

function setAuth(isAuthenticated: boolean, role: AccountRole | null) {
  act(() => {
    useAuthStore.setState({ isAuthenticated, role });
  });
}

describe('AboutSection', () => {
  const initialAuthState = useAuthStore.getState();

  afterEach(() => {
    act(() => {
      useAuthStore.setState(initialAuthState, true);
    });
  });

  it('renders the about content and story', () => {
    setAuth(false, null);

    render(
      <MemoryRouter>
        <AboutSection />
      </MemoryRouter>,
    );

    expect(screen.getByText('About Axiora Pulse')).toBeInTheDocument();
    expect(screen.getByText(/Turn Your Business Idea/)).toBeInTheDocument();
    expect(screen.getByText('Our Story')).toBeInTheDocument();
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('navigates to register when unauthenticated and Get Started is clicked', () => {
    setAuth(false, null);

    render(
      <MemoryRouter>
        <AboutSection />
      </MemoryRouter>,
    );

    const link = screen.getByText('Get Started');
    fireEvent.click(link);

    expect(link.getAttribute('href')).toBe('#register');
  });
});

describe('AIMentorSection', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: jest.fn().mockImplementation((cb) => {
        cb(Date.now());
        return 1;
      }),
    });
    Object.defineProperty(window, 'cancelAnimationFrame', {
      writable: true,
      value: jest.fn(),
    });
  });

  it('renders all AI mentor cards', () => {
    render(<AIMentorSection />);

    expect(screen.getByText('Meet Your AI Mentor')).toBeInTheDocument();
    expect(screen.getByText('Idea Validation Agent')).toBeInTheDocument();
    expect(screen.getByText('Market Research & Business Model Agent')).toBeInTheDocument();
    expect(screen.getByText('Survey Intelligence Agent')).toBeInTheDocument();
  });

  it('updates text reveal progress and skips card layout when scrollable distance is not positive', () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
      writable: true,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1200,
      writable: true,
    });

    const { container } = render(<AIMentorSection />);
    const section = container.querySelector('.ai-mentor-section') as unknown as HTMLElement;
    const title = container.querySelector('.ai-mentor-title') as unknown as HTMLElement;
    const subtitle = container.querySelector('.ai-mentor-subtitle') as unknown as HTMLElement;

    Object.defineProperty(section, 'offsetHeight', { configurable: true, value: 600 });
    section.getBoundingClientRect = jest.fn(() => ({ top: 400 }) as DOMRect);

    fireEvent.scroll(window);

    expect(title.style.getPropertyValue('--reveal-progress')).toBeTruthy();
    expect(subtitle.style.getPropertyValue('--reveal-progress')).toBeTruthy();
  });

  it('clamps scroll progress and transforms mentor cards on desktop', () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
      writable: true,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1200,
      writable: true,
    });

    const { container } = render(<AIMentorSection />);
    const section = container.querySelector('.ai-mentor-section') as unknown as HTMLElement;

    Object.defineProperty(section, 'offsetHeight', { configurable: true, value: 2000 });
    section.getBoundingClientRect = jest.fn(() => ({ top: -600 }) as DOMRect);

    fireEvent.scroll(window);

    const cards = Array.from(container.querySelectorAll('.mentor-card-item'));
    const first = cards[0] as HTMLElement;
    expect(first.style.transform).toContain('translate3d(0,');
    expect(first.style.opacity).toBeTruthy();
  });

  it('clamps the last card delta when progress exceeds its target', () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
      writable: true,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1200,
      writable: true,
    });

    const { container } = render(<AIMentorSection />);
    const section = container.querySelector('.ai-mentor-section') as unknown as HTMLElement;

    Object.defineProperty(section, 'offsetHeight', { configurable: true, value: 2000 });
    section.getBoundingClientRect = jest.fn(() => ({ top: -1180 }) as DOMRect);

    fireEvent.scroll(window);

    const last = container.querySelector('.mentor-card-item:last-child') as unknown as HTMLElement;
    expect(last.style.opacity).toBeTruthy();
  });

  it('marks a card as active step when its target ratio aligns with scroll progress', () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
      writable: true,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1200,
      writable: true,
    });

    const { container } = render(<AIMentorSection />);
    const section = container.querySelector('.ai-mentor-section') as unknown as HTMLElement;

    Object.defineProperty(section, 'offsetHeight', { configurable: true, value: 2000 });
    section.getBoundingClientRect = jest.fn(() => ({ top: -480 }) as DOMRect);

    fireEvent.scroll(window);

    const cards = Array.from(container.querySelectorAll('.mentor-card-item'));
    const active = cards.find((card) => card.classList.contains('active-step-card'));
    expect(active).toBeDefined();
  });

  it('uses mobile transform when viewport width is small', () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
      writable: true,
    });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 600, writable: true });

    const { container } = render(<AIMentorSection />);
    const section = container.querySelector('.ai-mentor-section') as unknown as HTMLElement;

    Object.defineProperty(section, 'offsetHeight', { configurable: true, value: 2000 });
    section.getBoundingClientRect = jest.fn(() => ({ top: -600 }) as DOMRect);

    fireEvent.scroll(window);

    const first = container.querySelector(
      '.mentor-card-item:first-child',
    ) as unknown as HTMLElement;
    expect(first.style.transform).toContain('translate3d(-50%,');
  });

  it('fires a resize event to re-run the scroll handler', () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
      writable: true,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1200,
      writable: true,
    });

    const { container } = render(<AIMentorSection />);
    const section = container.querySelector('.ai-mentor-section') as unknown as HTMLElement;

    Object.defineProperty(section, 'offsetHeight', { configurable: true, value: 2000 });
    section.getBoundingClientRect = jest.fn(() => ({ top: -600 }) as DOMRect);

    fireEvent.resize(window);
    const first = container.querySelector(
      '.mentor-card-item:first-child',
    ) as unknown as HTMLElement;
    expect(first.style.transform).toContain('translate3d(0,');
  });
});

describe('StartupJourneySection', () => {
  it('renders all journey steps and links', () => {
    render(
      <MemoryRouter>
        <StartupJourneySection />
      </MemoryRouter>,
    );

    expect(screen.getByText('Where are you now?')).toBeInTheDocument();
    expect(screen.getByText('Register Your Account')).toBeInTheDocument();
    expect(screen.getByText('Create a Workspace')).toBeInTheDocument();
    expect(screen.getByText('Run Validation.')).toBeInTheDocument();
    expect(screen.getByText('Export Indetail Report.')).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBe(5);
  });
});

describe('TestimonialsSection', () => {
  it('renders header and duplicated testimonials', () => {
    render(<TestimonialsSection />);

    expect(screen.getByText('TESTIMONIALS')).toBeInTheDocument();
    expect(screen.getByText(/Hear it from our partners/)).toBeInTheDocument();

    const alexCards = screen.getAllByText('Alex M.');
    expect(alexCards.length).toBe(2);

    expect(screen.getAllByText('Sarah K.').length).toBe(2);
    expect(screen.getAllByText('Startup Founder').length).toBe(2);
  });
});
