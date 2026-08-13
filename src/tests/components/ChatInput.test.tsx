import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { ChatInput, type ChatAttachment } from '@components/chat/ChatInput';

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

  describe('attachments', () => {
    const attachments: ChatAttachment[] = [
      { id: 1, name: 'photo.png', url: '/photo.png', type: 'image' },
      { id: 2, name: 'deck.pdf', url: '/deck.pdf', type: 'pdf' },
      { id: 3, name: 'spec.doc', url: '/spec.doc', type: 'doc' },
      { id: 4, name: 'axiora.com', url: 'https://axiora.com', type: 'link' },
    ];

    function renderWithAttachments(props: Partial<React.ComponentProps<typeof ChatInput>> = {}) {
      const onSubmit = jest.fn();
      const onRemoveAttachment = jest.fn();

      render(
        <ChatInput
          value=""
          onChange={jest.fn()}
          onSubmit={onSubmit}
          attachments={attachments}
          onRemoveAttachment={onRemoveAttachment}
          {...props}
        />,
      );

      return { onSubmit, onRemoveAttachment };
    }

    it('renders a chip per attachment', () => {
      renderWithAttachments();

      for (const attachment of attachments) {
        expect(screen.getByText(attachment.name)).toBeInTheDocument();
      }
    });

    it('removes an attachment through its remove button', async () => {
      const user = userEvent.setup();
      const { onRemoveAttachment } = renderWithAttachments();

      await user.click(screen.getByRole('button', { name: 'Remove deck.pdf' }));

      expect(onRemoveAttachment).toHaveBeenCalledWith(2);
    });

    it('omits remove buttons when no removal handler is supplied', () => {
      render(
        <ChatInput value="" onChange={jest.fn()} onSubmit={jest.fn()} attachments={attachments} />,
      );

      expect(screen.queryByRole('button', { name: /^Remove / })).not.toBeInTheDocument();
    });

    it('enables sending with attachments even when the message is empty', () => {
      renderWithAttachments();

      expect(screen.getByRole('button', { name: /send/i })).toBeEnabled();
    });

    it('blocks sending while an attachment is still uploading', async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderWithAttachments({
        attachments: [{ id: 5, name: 'big.pdf', url: '', type: 'pdf', isUploading: true }],
      });

      expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();

      await user.type(screen.getByPlaceholderText('Describe your startup idea...'), '{Enter}');

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('submits on Enter when attachments are present without any typed text', async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderWithAttachments();

      await user.type(screen.getByPlaceholderText('Describe your startup idea...'), '{Enter}');

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not submit on Enter while the input is disabled', async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderWithAttachments({ disabled: true });

      await user.type(screen.getByPlaceholderText('Describe your startup idea...'), '{Enter}');

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
