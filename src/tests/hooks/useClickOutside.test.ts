import { renderHook } from '@testing-library/react';
import { useRef } from 'react';

import { useClickOutside } from '@hooks/useClickOutside';

function firePointerDown(target: HTMLElement) {
  // jsdom doesn't implement PointerEvent, but the handler only reads `target`,
  // so a plain bubbling Event with the right type satisfies the listener.
  target.dispatchEvent(new Event('pointerdown', { bubbles: true }));
}

function setup(handler: () => void) {
  const container = document.createElement('div');
  const inside = document.createElement('button');
  const outside = document.createElement('button');
  container.appendChild(inside);
  document.body.appendChild(container);
  document.body.appendChild(outside);

  const { unmount } = renderHook(() => {
    const ref = useRef<HTMLDivElement | null>(container);
    useClickOutside(ref, handler);
  });

  return { container, inside, outside, unmount };
}

describe('useClickOutside', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('calls the handler when a pointerdown happens outside the ref element', () => {
    const handler = jest.fn();
    const { outside } = setup(handler);

    firePointerDown(outside);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call the handler when a pointerdown happens inside the ref element', () => {
    const handler = jest.fn();
    const { inside } = setup(handler);

    firePointerDown(inside);

    expect(handler).not.toHaveBeenCalled();
  });

  it('removes the event listener on unmount', () => {
    const handler = jest.fn();
    const { outside, unmount } = setup(handler);

    unmount();
    firePointerDown(outside);

    expect(handler).not.toHaveBeenCalled();
  });
});
