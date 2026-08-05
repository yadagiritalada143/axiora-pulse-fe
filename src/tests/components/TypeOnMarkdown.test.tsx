import { act, render, screen } from '@testing-library/react';

import { TypeOnMarkdown } from '@components/chat/TypeOnMarkdown';

jest.mock('remark-gfm', () => () => null);
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <p>{children}</p>;
  };
});

describe('TypeOnMarkdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reveals a completed reply one character at a time', () => {
    render(<TypeOnMarkdown content="Hello" />);

    expect(screen.queryByText('Hello')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(8);
    });
    expect(screen.getByText('He')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(12);
    });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
