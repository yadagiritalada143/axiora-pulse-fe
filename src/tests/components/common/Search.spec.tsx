import { act, fireEvent, render, screen } from '@testing-library/react';

import { Search } from '@components/common/Search';

describe('Search', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('calls onSearch with the debounced input value', () => {
    const onSearch = jest.fn();
    render(<Search onSearch={onSearch} />);

    const input = screen.getByLabelText('Search');
    act(() => {
      fireEvent.change(input, { target: { value: 'hello' } });
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledWith('hello');
  });

  it('renders the provided placeholder', () => {
    render(<Search onSearch={jest.fn()} placeholder="Find things" />);
    expect(screen.getByPlaceholderText('Find things')).toBeInTheDocument();
  });
});
