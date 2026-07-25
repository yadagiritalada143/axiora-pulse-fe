import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';

import { useClickOutside } from '@hooks/useClickOutside';

function Harness({ onOutside }: { onOutside: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onOutside);
  return (
    <div>
      <div ref={ref} data-testid="inside">
        inside
      </div>
      <button data-testid="outside">outside</button>
    </div>
  );
}

describe('useClickOutside', () => {
  it('calls the handler on a pointerdown outside the ref', () => {
    const onOutside = jest.fn();
    render(<Harness onOutside={onOutside} />);

    fireEvent.pointerDown(screen.getByTestId('outside'));

    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it('does not call the handler when clicking inside the ref', () => {
    const onOutside = jest.fn();
    render(<Harness onOutside={onOutside} />);

    fireEvent.pointerDown(screen.getByTestId('inside'));

    expect(onOutside).not.toHaveBeenCalled();
  });
});
