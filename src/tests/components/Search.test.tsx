import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Search } from '@components/common/Search';

describe('Search', () => {
  it('renders with the default placeholder and calls onSearch with an empty value on mount', () => {
    const onSearch = jest.fn();
    render(<Search onSearch={onSearch} />);

    expect(screen.getByPlaceholderText('Search anything...')).toBeInTheDocument();
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('renders a custom placeholder when provided', () => {
    render(<Search onSearch={jest.fn()} placeholder="Find a workspace" />);

    expect(screen.getByPlaceholderText('Find a workspace')).toBeInTheDocument();
  });

  it('debounces onSearch calls while typing', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    const onSearch = jest.fn();

    render(<Search onSearch={onSearch} debounceMs={300} />);
    onSearch.mockClear();

    const input = screen.getByLabelText('Search');
    await user.type(input, 'hello');

    // Nothing fires until the debounce delay elapses.
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Only the final debounced value should fire.
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenLastCalledWith('hello');
    expect(input).toHaveValue('hello');

    jest.useRealTimers();
  });
});
