import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { ChatInput } from '@components/chat/ChatInput';

// Minimal stand-in for the browser's SpeechRecognition API (not implemented in jsdom), matching
// the subset ChatInput actually uses.
interface FakeSpeechRecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface FakeSpeechRecognitionEvent {
  resultIndex: number;
  results: { length: number; [index: number]: FakeSpeechRecognitionResult };
}
class FakeSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onstart: (() => void) | null = null;
  onresult: ((event: FakeSpeechRecognitionEvent) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = jest.fn(() => this.onstart?.());
  stop = jest.fn(() => this.onend?.());
}

function Controlled({
  onSubmit,
  onAttach,
  disabled,
}: {
  onSubmit: (value: string) => void;
  onAttach?: (files: FileList) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');
  return (
    <ChatInput
      value={value}
      onChange={setValue}
      onSubmit={() => {
        onSubmit(value);
        setValue('');
      }}
      onAttach={onAttach}
      disabled={disabled}
    />
  );
}

describe('ChatInput', () => {
  it('renders the default placeholder', () => {
    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);

    expect(screen.getByPlaceholderText('Describe your startup idea...')).toBeInTheDocument();
  });

  it('renders a custom placeholder when provided', () => {
    render(
      <ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} placeholder="Ask anything" />,
    );

    expect(screen.getByPlaceholderText('Ask anything')).toBeInTheDocument();
  });

  it('calls onChange as the user types', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ChatInput value="" onChange={onChange} onSubmit={jest.fn()} />);

    await user.type(screen.getByPlaceholderText('Describe your startup idea...'), 'Hi');

    expect(onChange).toHaveBeenCalledWith('H');
    expect(onChange).toHaveBeenCalledWith('i');
  });

  it('disables the send button when the value is empty or only whitespace', () => {
    const { rerender } = render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();

    rerender(<ChatInput value="   " onChange={jest.fn()} onSubmit={jest.fn()} />);
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('enables the send button and calls onSubmit when clicked with content', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<ChatInput value="Hello there" onChange={jest.fn()} onSubmit={onSubmit} />);

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeEnabled();

    await user.click(sendButton);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('submits on Enter (without Shift) when there is content, and clears the input', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<Controlled onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('Describe your startup idea...');
    await user.type(textarea, 'Ship it{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('Ship it');
    expect(textarea).toHaveValue('');
  });

  it('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<ChatInput value="Some text" onChange={jest.fn()} onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('Describe your startup idea...');
    await user.type(textarea, '{Shift>}{Enter}{/Shift}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not render an attach button when onAttach is not provided', () => {
    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);

    expect(screen.queryByRole('button', { name: 'Attach files' })).not.toBeInTheDocument();
  });

  it('renders an attach button and calls onAttach when a file is selected', async () => {
    const user = userEvent.setup();
    const onAttach = jest.fn<void, [FileList]>();

    render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} onAttach={onAttach} />);

    const attachButton = screen.getByRole('button', { name: 'Attach files' });
    expect(attachButton).toBeInTheDocument();

    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput) throw new Error('Expected a hidden file input to be rendered');
    await user.upload(fileInput, file);

    expect(onAttach).toHaveBeenCalledTimes(1);
    const [calledWith] = onAttach.mock.calls[0] ?? [];
    expect(calledWith).toHaveLength(1);
    expect(calledWith?.[0]?.name).toBe('notes.txt');
  });

  it('disables the textarea and send button when disabled is true', () => {
    render(<ChatInput value="Hello" onChange={jest.fn()} onSubmit={jest.fn()} disabled />);

    expect(screen.getByPlaceholderText('Describe your startup idea...')).toBeDisabled();
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  describe('voice input', () => {
    let instances: FakeSpeechRecognition[];

    function getRecognition(): FakeSpeechRecognition {
      const recognition = instances[0];
      if (!recognition) throw new Error('Expected a SpeechRecognition instance to be created');
      return recognition;
    }

    beforeEach(() => {
      instances = [];
      (window as unknown as Record<'SpeechRecognition', unknown>).SpeechRecognition = jest
        .fn()
        .mockImplementation(() => {
          const instance = new FakeSpeechRecognition();
          instances.push(instance);
          return instance;
        });
    });

    afterEach(() => {
      delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
      jest.useRealTimers();
    });

    it('records in continuous mode and auto-stops after 20 seconds, not sooner', () => {
      jest.useFakeTimers();
      render(<ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: 'Start voice typing' }));
      const recognition = getRecognition();
      expect(recognition.continuous).toBe(true);

      act(() => {
        jest.advanceTimersByTime(19_999);
      });
      expect(recognition.stop).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(recognition.stop).toHaveBeenCalledTimes(1);
    });

    it('accumulates multiple final phrases spoken during one recording', () => {
      const onChange = jest.fn();
      render(<ChatInput value="" onChange={onChange} onSubmit={jest.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: 'Start voice typing' }));
      const recognition = getRecognition();

      act(() => {
        recognition.onresult?.({
          resultIndex: 0,
          results: { length: 1, 0: { isFinal: true, 0: { transcript: 'hello' } } },
        });
      });
      expect(onChange).toHaveBeenLastCalledWith('hello');

      act(() => {
        recognition.onresult?.({
          resultIndex: 1,
          results: {
            length: 2,
            0: { isFinal: true, 0: { transcript: 'hello' } },
            1: { isFinal: true, 0: { transcript: 'world' } },
          },
        });
      });
      expect(onChange).toHaveBeenLastCalledWith('hello world');
    });
  });
});
