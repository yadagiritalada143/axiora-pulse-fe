import { act, fireEvent, render } from '@testing-library/react';

import { MagicRingsBg } from '@features/landing/components/MagicRingsBg';

jest.mock('three', () => {
  const MockVector2 = jest.fn().mockImplementation((x = 0, y = 0) => ({
    x,
    y,
    set: jest.fn(),
  }));
  const MockColor = jest.fn().mockImplementation(() => ({ set: jest.fn() }));
  return {
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      domElement: globalThis.document.createElement('canvas'),
      setClearColor: jest.fn(),
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
    })),
    Scene: jest.fn().mockImplementation(() => ({ add: jest.fn() })),
    OrthographicCamera: jest.fn().mockImplementation(() => ({ position: { z: 0 } })),
    ShaderMaterial: jest.fn().mockImplementation(() => ({
      transparent: false,
      dispose: jest.fn(),
    })),
    PlaneGeometry: jest.fn().mockImplementation(() => ({ dispose: jest.fn() })),
    Mesh: jest.fn().mockImplementation(() => ({})),
    Vector2: MockVector2,
    Color: MockColor,
  };
});

describe('MagicRingsBg', () => {
  let rafCb: ((t: number) => void) | undefined;

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
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as never);
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
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 700,
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 1,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the container with the provided className', () => {
    render(<MagicRingsBg className="my-bg" />);

    const container = document.getElementById('magic-rings-bg');
    expect(container).not.toBeNull();
    expect(container?.className).toContain('my-bg');
    expect(container?.className).toContain('magic-rings-container');
  });

  it('runs the animation loop and renders the scene', () => {
    render(<MagicRingsBg />);
    expect(rafCb).toBeDefined();

    act(() => {
      runFrames(3, 0);
    });
  });

  it('handles mouse move, hover, and click interactions over multiple frames', () => {
    render(<MagicRingsBg />);

    act(() => {
      runFrames(2, 0);
    });

    fireEvent.mouseEnter(window);
    fireEvent.mouseMove(window, { clientX: 400, clientY: 200 });

    act(() => {
      runFrames(5, 500);
    });

    fireEvent.click(window);
    act(() => {
      runFrames(5, 1000);
    });

    fireEvent.mouseLeave(window);
    act(() => {
      runFrames(5, 1500);
    });
  });

  it('recomputes sizing on window resize', () => {
    render(<MagicRingsBg />);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    act(() => {
      runFrames(2, 0);
    });
  });

  it('cleans up listeners and disposes resources on unmount', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<MagicRingsBg />);
    unmount();
    expect(removeSpy).toHaveBeenCalled();
  });
});
