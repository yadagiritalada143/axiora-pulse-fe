import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatInput } from '@components/chat/ChatInput';

interface MockRecognizer {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult:
    | ((event: {
        results: Record<number, Record<number, { transcript: string }> & { isFinal: boolean }> & {
          length: number;
        };
        resultIndex: number;
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: jest.Mock;
  stop: jest.Mock;
}

let currentRecognition: MockRecognizer | null;

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onstart: (() => void) | null = null;
  onresult: ((event: never) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = jest.fn();
  stop = jest.fn();

  constructor() {
    currentRecognition = this as unknown as MockRecognizer;
  }
}

function installSpeechRecognition() {
  Object.defineProperty(window, 'SpeechRecognition', {
    configurable: true,
    writable: true,
    value: MockSpeechRecognition,
  });
}

function fireResult(
  recog: MockRecognizer,
  resultIndex: number,
  results: { transcript: string; isFinal: boolean }[],
) {
  const list: Record<number, { transcript: string; isFinal: boolean }> & { length: number } = {
    length: results.length,
  };
  results.forEach((r, i) => {
    list[i] = { 0: { transcript: r.transcript }, isFinal: r.isFinal } as never;
  });
  recog.onresult?.({ results: list, resultIndex });
}

describe('ChatInput speech recognition', () => {
  beforeEach(() => {
    currentRecognition = null;
    installSpeechRecognition();
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition;
    jest.useRealTimers();
  });

  it('renders a mic button when speech recognition is supported', () => {
    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);
    expect(screen.getByRole('button', { name: /Start voice typing/i })).toBeInTheDocument();
  });

  it('does not render a mic button when speech recognition is unsupported', () => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition;

    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);

    expect(screen.queryByRole('button', { name: /Start voice typing/i })).not.toBeInTheDocument();
  });

  it('starts listening, appends a final transcript, and stops on end', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ChatInput value="Hello" onChange={onChange} onSubmit={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /Start voice typing/i }));

    expect(currentRecognition).not.toBeNull();
    expect(currentRecognition?.start).toHaveBeenCalled();

    act(() => {
      currentRecognition?.onstart?.();
    });
    expect(screen.getByText(/Listening.../)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stop voice typing/i })).toBeInTheDocument();

    act(() => {
      fireResult(currentRecognition as unknown as MockRecognizer, 0, [
        { transcript: 'voice note', isFinal: true },
        { transcript: 'ignored', isFinal: false },
      ]);
    });

    expect(onChange).toHaveBeenCalledWith('Hello voice note');

    act(() => {
      currentRecognition?.onend?.();
    });
    expect(screen.queryByText(/Listening.../)).not.toBeInTheDocument();
  });

  it('stops listening when the mic is clicked again while listening', async () => {
    const user = userEvent.setup();
    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /Start voice typing/i }));
    act(() => {
      currentRecognition?.onstart?.();
    });

    await user.click(screen.getByRole('button', { name: /Stop voice typing/i }));

    expect(currentRecognition?.stop).toHaveBeenCalled();
  });

  it('handles speech recognition errors by stopping the listening state', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /Start voice typing/i }));
    act(() => {
      currentRecognition?.onstart?.();
    });

    act(() => {
      currentRecognition?.onerror?.({ error: 'no-speech' });
    });

    expect(consoleSpy).toHaveBeenCalledWith('Speech recognition error:', 'no-speech');
    expect(screen.queryByText(/Listening.../)).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('auto-stops recording after the max duration', () => {
    jest.useFakeTimers();

    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Start voice typing/i }));
    act(() => {
      currentRecognition?.onstart?.();
    });

    act(() => {
      jest.advanceTimersByTime(20_100);
    });

    expect(currentRecognition?.stop).toHaveBeenCalled();
  });

  it('falls back to webkitSpeechRecognition when SpeechRecognition is missing', async () => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition;
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      configurable: true,
      writable: true,
      value: MockSpeechRecognition,
    });

    const user = userEvent.setup();
    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /Start voice typing/i }));

    expect(currentRecognition).not.toBeNull();
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  });

  it('swallows constructor failures gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    class ThrowingRecognition {
      constructor() {
        throw new Error('not available');
      }
    }
    Object.defineProperty(window, 'SpeechRecognition', {
      configurable: true,
      writable: true,
      value: ThrowingRecognition,
    });

    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /Start voice typing/i }));

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('cleans up the active recognition on unmount', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /Start voice typing/i }));
    act(() => {
      currentRecognition?.onstart?.();
    });

    unmount();

    expect(currentRecognition?.stop).toHaveBeenCalled();
  });
});

describe('ChatInput menu behavior', () => {
  it('closes the file menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} onAttach={jest.fn()} />);

    const attachButton = screen.getByRole('button', { name: 'Attach files' });
    await user.click(attachButton);
    expect(screen.getByRole('menu', { name: 'Select file type to upload' })).toBeInTheDocument();

    await user.click(document.body);
    expect(
      screen.queryByRole('menu', { name: 'Select file type to upload' }),
    ).not.toBeInTheDocument();
  });

  it('closes the file menu when pressing Escape', async () => {
    const user = userEvent.setup();
    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} onAttach={jest.fn()} />);

    const attachButton = screen.getByRole('button', { name: 'Attach files' });
    await user.click(attachButton);

    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('menu', { name: 'Select file type to upload' }),
    ).not.toBeInTheDocument();
  });

  it('opens the native file picker when a file type is chosen', async () => {
    const user = userEvent.setup();
    const clickSpy = jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});

    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} onAttach={jest.fn()} />);

    const attachButton = screen.getByRole('button', { name: 'Attach files' });
    await user.click(attachButton);

    await user.click(screen.getByRole('menuitem', { name: /PDF Document/i }));

    await waitFor(() => expect(clickSpy).toHaveBeenCalled());
    clickSpy.mockRestore();
  });
});
