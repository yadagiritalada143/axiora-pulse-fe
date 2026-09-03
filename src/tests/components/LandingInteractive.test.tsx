import { act, fireEvent, render, screen } from '@testing-library/react';

import { BurstSection } from '@features/landing/components/BurstSection';
import { FAQSection } from '@features/landing/components/FAQSection';
import { Preloader } from '@features/landing/components/Preloader';
import { ScrollToTop } from '@features/landing/components/ScrollToTop';

describe('Preloader', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null when preloader already shown in sessionStorage', () => {
    sessionStorage.setItem('preloaderShown', 'true');
    const { container } = render(<Preloader />);
    expect(container.firstChild).toBeNull();
  });

  it('renders initial count of 0', () => {
    render(<Preloader />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('increments count over time and calls onComplete when reaching 100', () => {
    const onComplete = jest.fn();
    render(<Preloader onComplete={onComplete} />);

    act(() => {
      jest.advanceTimersByTime(20 * 100);
    });

    expect(screen.getByText('100')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(300);
      jest.advanceTimersByTime(600);
    });

    expect(onComplete).toHaveBeenCalled();
    expect(sessionStorage.getItem('preloaderShown')).toBe('true');
  });
});

describe('ScrollToTop', () => {
  let scrollSpy: jest.SpyInstance;

  beforeEach(() => {
    scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    scrollSpy.mockRestore();
  });

  it('button is hidden initially and appears when scrolled past 250px', () => {
    render(<ScrollToTop />);

    const button = screen.getByRole('button', { name: 'Scroll to top' });
    expect(button.className).not.toContain('visible');
  });

  it('calls window.scrollTo when clicked', () => {
    render(<ScrollToTop />);

    const button = screen.getByRole('button', { name: 'Scroll to top' });
    fireEvent.click(button);

    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});

describe('FAQSection', () => {
  it('renders FAQ questions with FAQ 2 active by default', () => {
    render(<FAQSection />);

    expect(screen.getByText(/Frequently Asked/)).toBeInTheDocument();
    expect(screen.getByText('Is there a free plan available?')).toBeInTheDocument();
    expect(screen.getByText(/Yes! We offer a free plan/)).toBeInTheDocument();
    expect(screen.getByText(/Contact Us/)).toBeInTheDocument();
  });

  it('toggles an active FAQ item off on click', () => {
    render(<FAQSection />);

    const activeItem = document.getElementById('faq-item-2');
    expect(activeItem?.className).toContain('active');
    expect(document.getElementById('faq-body-2')?.style.maxHeight).toBe('200px');

    fireEvent.click(screen.getByText('Can I invite my team members?'));

    expect(activeItem?.className).not.toContain('active');
    expect(document.getElementById('faq-body-2')?.style.maxHeight).toBe('0px');
  });

  it('opens a closed FAQ item on Enter key press', () => {
    render(<FAQSection />);

    expect(document.getElementById('faq-body-3')?.style.maxHeight).toBe('0px');

    fireEvent.keyDown(screen.getByText('Does it integrate with other tools?'), {
      key: 'Enter',
    });

    expect(document.getElementById('faq-body-3')?.style.maxHeight).toBe('200px');
  });
});

describe('BurstSection', () => {
  let rafCb: ((t: number) => void) | undefined;
  const fakeContext = {
    setTransform: jest.fn(),
    clearRect: jest.fn(),
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    save: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    stroke: jest.fn(),
    restore: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
  };

  beforeEach(() => {
    rafCb = undefined;
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(fakeContext as unknown as CanvasRenderingContext2D);
    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: (cb: (t: number) => void) => {
        rafCb = cb;
        return 1;
      },
    });
    Object.defineProperty(window, 'cancelAnimationFrame', {
      writable: true,
      value: jest.fn(),
    });
    class MockIntersectionObserver {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: MockIntersectionObserver,
    });
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 800, height: 600, top: 0, left: 0, right: 800, bottom: 600 }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders canvas, hint, and footer copy', () => {
    render(<BurstSection />);

    expect(document.getElementById('burst-canvas')).not.toBeNull();
    expect(screen.getByText(/move your cursor through the strings/)).toBeInTheDocument();
    expect(screen.getByText(/ALL RIGHT RESERVED/)).toBeInTheDocument();
  });

  it('runs the animation frame and cleans up on unmount', () => {
    const { unmount } = render(<BurstSection />);

    expect(rafCb).toBeDefined();

    unmount();
  });
});
