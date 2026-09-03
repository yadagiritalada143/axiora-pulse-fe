import { act, fireEvent, render, screen } from '@testing-library/react';

import { BurstSection } from '@features/landing/components/BurstSection';

describe('BurstSection', () => {
  let rafCb: ((t: number) => void) | undefined;
  let observerCb: ((entries: IntersectionObserverEntry[]) => void) | undefined;

  const fakeContext: Record<string, unknown> = {
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

  function runFrames(count: number, startTime: number) {
    let t = startTime;
    for (let i = 0; i < count; i++) {
      t += 16.7;
      const cb = rafCb;
      if (!cb) break;
      cb(t);
    }
  }

  beforeEach(() => {
    rafCb = undefined;
    (fakeContext.setTransform as jest.Mock).mockClear();
    (fakeContext.stroke as jest.Mock).mockClear();
    (fakeContext.arc as jest.Mock).mockClear();

    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(fakeContext as unknown as CanvasRenderingContext2D);
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 1,
    });
    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      configurable: true,
      value: (cb: (t: number) => void) => {
        rafCb = cb;
        return 1;
      },
    });
    Object.defineProperty(window, 'cancelAnimationFrame', {
      writable: true,
      configurable: true,
      value: jest.fn(),
    });
    class MockIntersectionObserver {
      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
        observerCb = cb;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
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

  it('runs multiple animation frames rendering strings and dots', () => {
    render(<BurstSection />);
    expect(rafCb).toBeDefined();

    act(() => {
      runFrames(3, 0);
    });

    expect(fakeContext.clearRect as jest.Mock).toHaveBeenCalled();
    expect(fakeContext.stroke as jest.Mock).toHaveBeenCalled();
    expect(fakeContext.arc as jest.Mock).toHaveBeenCalled();
  });

  it('handles mouse movement into the influence zone and eases the target', () => {
    render(<BurstSection />);
    const section = document.getElementById('burst-section');
    expect(section).not.toBeNull();

    fireEvent.mouseMove(section as unknown as HTMLElement, { clientX: 400, clientY: 200 });

    act(() => {
      runFrames(30, 0);
    });

    expect(fakeContext.stroke as jest.Mock).toHaveBeenCalled();
  });

  it('handles mouse leave and touch end disabling interaction', () => {
    render(<BurstSection />);
    const section = document.getElementById('burst-section');
    expect(section).not.toBeNull();

    fireEvent.mouseMove(section as unknown as HTMLElement, { clientX: 500, clientY: 300 });
    act(() => {
      runFrames(5, 0);
    });

    fireEvent.mouseLeave(section as unknown as HTMLElement);
    fireEvent.touchMove(section as unknown as HTMLElement, {
      touches: [{ clientX: 200, clientY: 400 }],
    });
    fireEvent.touchEnd(section as unknown as HTMLElement);

    act(() => {
      runFrames(10, 1000);
    });
    expect(fakeContext.stroke as jest.Mock).toHaveBeenCalled();
  });

  it('hides the hint once the timer fires while mouse is inactive', () => {
    jest.useFakeTimers();
    render(<BurstSection />);
    const hint = document.getElementById('burst-hint');

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(hint?.style.opacity).toBe('0.45');
    jest.useRealTimers();
  });

  it('cleans up listeners and animation on unmount', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<BurstSection />);
    unmount();
    expect(removeSpy).toHaveBeenCalled();
  });

  it('rebuilds strings on window resize', () => {
    render(<BurstSection />);
    const strokeBefore = (fakeContext.stroke as jest.Mock).mock.calls.length;
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    act(() => {
      runFrames(3, 0);
    });
    expect((fakeContext.stroke as jest.Mock).mock.calls.length).toBeGreaterThan(strokeBefore);
  });

  it('skips drawing while the section is not visible and resumes when visible', () => {
    render(<BurstSection />);
    const stroke = fakeContext.stroke as jest.Mock;
    stroke.mockClear();

    act(() => {
      observerCb?.([{ isIntersecting: false } as IntersectionObserverEntry]);
      runFrames(3, 0);
    });
    expect(stroke).not.toHaveBeenCalled();

    act(() => {
      observerCb?.([{ isIntersecting: true } as IntersectionObserverEntry]);
      runFrames(3, 1000);
    });
    expect(stroke).toHaveBeenCalled();
  });
});
