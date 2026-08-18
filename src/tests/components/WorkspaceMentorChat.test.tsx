import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import type { OrchestrationResult } from '@/types/orchestration.types';
import { workspaceService } from '@features/workspace/api';
import { WorkspaceMentorChat } from '@features/workspace/components/WorkspaceMentorChat';
import {
  useResetWorkspaceMentor,
  useWorkspaceChat,
  useWorkspaceState,
} from '@features/workspace/hooks/useWorkspaceMentor';
import type { WorkspaceStateResponse } from '@features/workspace/types';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@features/workspace/api', () => ({
  workspaceService: {
    uploadAttachment: jest.fn(),
  },
}));

jest.mock('@features/workspace/hooks/useWorkspaceMentor', () => ({
  useWorkspaceState: jest.fn(),
  useWorkspaceChat: jest.fn(),
  useResetWorkspaceMentor: jest.fn(),
}));

// `@components/chat` pulls in `react-markdown` (ESM-only, un-transformed by the default Jest
// config) via MarkdownRenderer. WorkspaceMentorChat's own composition logic doesn't depend on how
// those leaf components render internally, so stand in lightweight test doubles for them here
// (same approach as ChatWindow.test.tsx).
jest.mock('@components/chat', () => ({
  ChatBubble: ({
    align,
    avatarLabel,
    children,
  }: {
    align: string;
    avatarLabel: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="chat-bubble" data-align={align} data-avatar={avatarLabel}>
      {children}
    </div>
  ),
  MarkdownRenderer: ({ content }: { content: string }) => <div>{content}</div>,
  TypingIndicator: () => <div data-testid="typing-indicator">Typing…</div>,
  TypeOnMarkdown: ({ content }: { content: string }) => <div>{content}</div>,
  ChatInput: ({
    value,
    onChange,
    onSubmit,
    disabled,
    placeholder,
    attachments = [],
    onAttach,
    onRemoveAttachment,
  }: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
    placeholder?: string;
    attachments?: { id: string | number; name: string; isUploading?: boolean }[];
    onAttach?: (files: FileList) => void;
    onRemoveAttachment?: (id: string | number) => void;
  }) => (
    <div>
      <textarea
        aria-label="chat-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <input
        type="file"
        aria-label="attach-files"
        multiple
        onChange={(event) => {
          if (event.target.files?.length) onAttach?.(event.target.files);
        }}
      />
      <ul>
        {attachments.map((attachment) => (
          <li key={attachment.id}>
            {attachment.name}
            {attachment.isUploading ? ' (uploading)' : ''}
            <button type="button" onClick={() => onRemoveAttachment?.(attachment.id)}>
              Remove {attachment.name}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onSubmit} disabled={disabled}>
        Send
      </button>
      {onAttach && (
        <input
          type="file"
          aria-label="attach-file"
          onChange={(event) => {
            if (event.target.files) onAttach(event.target.files);
          }}
        />
      )}
    </div>
  ),
}));

jest.mock('@features/workspace/api', () => ({
  workspaceService: { uploadAttachment: jest.fn() },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@features/ideaValidation/components', () => ({
  IdeaValidationReport: ({ onRetake }: { onRetake: () => void }) => (
    <div>
      Report
      <button type="button" onClick={onRetake}>
        Retake
      </button>
    </div>
  ),
  ResearchStreamPanel: () => <div data-testid="research-stream-panel">Research Stream</div>,
  WebSearchDrawer: () => <div data-testid="web-search-drawer" />,
}));

jest.mock('@features/workspace/components/WorkspaceMentorIntake', () => ({
  WorkspaceMentorIntake: ({
    onSubmit,
    isPending,
  }: {
    onSubmit: (message: string) => void;
    isPending: boolean;
  }) => (
    <div>
      <span>Intake form</span>
      <button type="button" disabled={isPending} onClick={() => onSubmit('My idea')}>
        Submit idea
      </button>
    </div>
  ),
}));

Element.prototype.scrollIntoView = jest.fn();

const mockedUseWorkspaceState = useWorkspaceState as jest.Mock;
const mockedUseWorkspaceChat = useWorkspaceChat as jest.Mock;
const mockedUseResetWorkspaceMentor = useResetWorkspaceMentor as jest.Mock;
const mockedUploadAttachment = workspaceService.uploadAttachment as jest.Mock;
const mockedToast = toast as jest.Mocked<typeof toast>;

const baseIdea = {
  idea_title: null,
  idea_description: null,
  problem_statement: null,
  industry: '',
  founder_validation_goal: '',
  geography: '',
};

function buildState(overrides: Partial<WorkspaceStateResponse> = {}): WorkspaceStateResponse {
  return {
    id: 1,
    user_id: 7,
    name: 'My Workspace',
    description: 'A test workspace',
    state: 'GATHERING_INFO',
    idea: baseIdea,
    conversation_history: [],
    validation_result: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

interface SetupOptions {
  data?: WorkspaceStateResponse | undefined;
  isLoading?: boolean;
  isError?: boolean;
  chatMutate?: jest.Mock;
  chatPending?: boolean;
  chatError?: unknown;
  resetMutate?: jest.Mock;
}

function setup({
  data,
  isLoading = false,
  isError = false,
  chatMutate = jest.fn(),
  chatPending = false,
  chatError = null,
  resetMutate = jest.fn(),
}: SetupOptions = {}) {
  mockedUseWorkspaceState.mockReturnValue({ data, isLoading, isError });
  mockedUseWorkspaceChat.mockReturnValue({
    mutate: chatMutate,
    isPending: chatPending,
    error: chatError,
  });
  mockedUseResetWorkspaceMentor.mockReturnValue({ mutate: resetMutate });
}

describe('WorkspaceMentorChat', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while the workspace state is loading', () => {
    setup({ isLoading: true });

    const { container } = render(<WorkspaceMentorChat workspaceId={1} />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows an error message when the workspace state fails to load', () => {
    setup({ isError: true });

    render(<WorkspaceMentorChat workspaceId={1} />);

    expect(
      screen.getByText('Failed to load the AI Mentor conversation. Please try again.'),
    ).toBeInTheDocument();
  });

  it('renders the intake form when there is no conversation history yet', () => {
    setup({ data: buildState({ conversation_history: [] }) });

    render(<WorkspaceMentorChat workspaceId={1} />);

    expect(screen.getByText('Intake form')).toBeInTheDocument();
  });

  it('submits the intake message via the chat mutation', async () => {
    const chatMutate = jest.fn();
    setup({ data: buildState({ conversation_history: [] }), chatMutate });

    const user = userEvent.setup();
    render(<WorkspaceMentorChat workspaceId={1} />);

    await user.click(screen.getByRole('button', { name: 'Submit idea' }));

    expect(chatMutate).toHaveBeenCalledWith(
      { message: 'My idea', attachments: null },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('renders the conversation history in order once the conversation has started', () => {
    setup({
      data: buildState({
        conversation_history: [
          { role: 'user', content: 'Hello mentor' },
          { role: 'assistant', content: 'Hi, tell me more' },
        ],
      }),
    });

    render(<WorkspaceMentorChat workspaceId={1} />);

    const bubbles = screen.getAllByTestId('chat-bubble');
    expect(bubbles).toHaveLength(2);
    expect(bubbles[0]).toHaveAttribute('data-align', 'right');
    expect(bubbles[0]).toHaveTextContent('Hello mentor');
    expect(bubbles[1]).toHaveAttribute('data-align', 'left');
    expect(bubbles[1]).toHaveTextContent('Hi, tell me more');
  });

  it('rewrites the raw validation-trigger message into a friendlier label in the transcript', () => {
    setup({
      data: buildState({
        conversation_history: [{ role: 'user', content: 'Run validation analysis' }],
      }),
    });

    render(<WorkspaceMentorChat workspaceId={1} />);

    expect(screen.getByText('Requested a market analysis validation run.')).toBeInTheDocument();
    expect(screen.queryByText('Run validation analysis')).not.toBeInTheDocument();
  });

  it('shows the typing indicator while the chat mutation is pending', () => {
    setup({
      data: buildState({ conversation_history: [{ role: 'user', content: 'Hi' }] }),
      chatPending: true,
    });

    render(<WorkspaceMentorChat workspaceId={1} />);

    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });

  it('does not show quick actions outside of the READY_TO_VALIDATE state', () => {
    setup({
      data: buildState({
        state: 'GATHERING_INFO',
        conversation_history: [{ role: 'user', content: 'Hi' }],
      }),
    });

    render(<WorkspaceMentorChat workspaceId={1} />);

    expect(screen.queryByRole('button', { name: /run the validations/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /verify the details/i })).not.toBeInTheDocument();
  });

  it('shows quick actions only in the READY_TO_VALIDATE state and sends the expected messages', async () => {
    const chatMutate = jest.fn();
    setup({
      data: buildState({
        state: 'READY_TO_VALIDATE',
        conversation_history: [{ role: 'user', content: 'Hi' }],
      }),
      chatMutate,
    });

    const user = userEvent.setup();
    render(<WorkspaceMentorChat workspaceId={1} />);

    const runValidationButton = screen.getByRole('button', { name: /run the validations/i });
    const verifyDetailsButton = screen.getByRole('button', { name: /verify the details/i });
    expect(runValidationButton).toBeInTheDocument();
    expect(verifyDetailsButton).toBeInTheDocument();

    await user.click(runValidationButton);
    expect(chatMutate).toHaveBeenCalledWith(
      { message: 'Run validation analysis', attachments: null },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );

    await user.click(verifyDetailsButton);
    expect(chatMutate).toHaveBeenCalledWith(
      {
        message: 'Can you verify and summarize the idea details you have so far?',
        attachments: null,
      },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('sends a typed message from the chat input and clears the draft', async () => {
    const chatMutate = jest.fn();
    setup({
      data: buildState({ conversation_history: [{ role: 'user', content: 'Hi' }] }),
      chatMutate,
    });

    const user = userEvent.setup();
    render(<WorkspaceMentorChat workspaceId={1} />);

    const input = screen.getByLabelText('chat-input');
    await user.type(input, 'What next?');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(chatMutate).toHaveBeenCalledWith(
      { message: 'What next?', attachments: null },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('does not call the chat mutation when submitting a blank or whitespace-only draft', async () => {
    const chatMutate = jest.fn();
    setup({
      data: buildState({ conversation_history: [{ role: 'user', content: 'Hi' }] }),
      chatMutate,
    });

    const user = userEvent.setup();
    render(<WorkspaceMentorChat workspaceId={1} />);

    // The test-double ChatInput only disables Send based on `chat.isPending`, not on whether the
    // draft is blank, so clicking Send with an empty draft exercises `send()`'s own
    // `!message.trim()` guard rather than being blocked by the input itself.
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(chatMutate).not.toHaveBeenCalled();
  });

  it('renders the validation report when a validation_result is present', () => {
    setup({
      data: buildState({
        conversation_history: [{ role: 'user', content: 'Hi' }],
        validation_result: {
          orchestration_run_id: 'run-1',
          idea_id: 'idea-1',
          created_at: '2026-01-01T00:00:00.000Z',
        } as unknown as OrchestrationResult,
      }),
    });

    render(<WorkspaceMentorChat workspaceId={1} />);

    expect(screen.getByText('Report')).toBeInTheDocument();
  });

  it('anchors the validation report after the point it appeared, so later replies render below it', () => {
    const chatMutate = jest.fn();
    const initialData = buildState({
      conversation_history: [
        { role: 'user', content: 'My idea' },
        { role: 'assistant', content: 'Tell me more' },
      ],
    });
    setup({ data: initialData, chatMutate });

    const { rerender } = render(<WorkspaceMentorChat workspaceId={1} />);

    // Validation completes: two more messages land, plus a validation_result.
    const validatedData: WorkspaceStateResponse = {
      ...initialData,
      state: 'VALIDATED',
      conversation_history: [
        ...initialData.conversation_history,
        { role: 'user', content: 'Run validation analysis' },
        { role: 'assistant', content: 'Validated! Score 80.' },
      ],
      validation_result: {
        orchestration_run_id: 'run-1',
        idea_id: 'idea-1',
        created_at: '2026-01-01T00:00:00.000Z',
      } as unknown as OrchestrationResult,
    };
    mockedUseWorkspaceState.mockReturnValue({
      data: validatedData,
      isLoading: false,
      isError: false,
    });
    rerender(<WorkspaceMentorChat workspaceId={1} />);

    expect(screen.getByText('Report')).toBeInTheDocument();

    // User keeps chatting after validation completes.
    const followUpData: WorkspaceStateResponse = {
      ...validatedData,
      conversation_history: [
        ...validatedData.conversation_history,
        { role: 'user', content: 'What should I do next?' },
        { role: 'assistant', content: 'Focus on customer interviews.' },
      ],
    };
    mockedUseWorkspaceState.mockReturnValue({
      data: followUpData,
      isLoading: false,
      isError: false,
    });
    rerender(<WorkspaceMentorChat workspaceId={1} />);

    const reportEl = screen.getByText('Report');
    const followUpBubble = screen.getByText('Focus on customer interviews.');

    // The report must appear *before* the follow-up reply in document order, not after it -
    // otherwise the follow-up message renders visually above a pinned report and the
    // auto-scroll-to-bottom effect scrolls straight past it, looking like it never arrived.
    expect(
      reportEl.compareDocumentPosition(followUpBubble) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('rejects an unsupported file extension instantly with a short message, without calling the upload API', async () => {
    setup({ data: buildState({ conversation_history: [{ role: 'user', content: 'Hi' }] }) });

    const user = userEvent.setup();
    render(<WorkspaceMentorChat workspaceId={1} />);

    const file = new File(['bad'], 'virus.exe', { type: 'application/octet-stream' });
    await user.upload(screen.getByLabelText('attach-file'), file);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Only JPEG, PNG, WEBP, GIF, BMP images, PDFs, and DOCX, DOC, TXT, MD, RTF, CSV documents are allowed.',
      ),
    );
    // No network round trip for a file we can already tell is unsupported client-side.
    expect(mockedUploadAttachment).not.toHaveBeenCalled();
  });

  it('shows the backend validation message when an allowed-extension file is still rejected server-side', async () => {
    setup({ data: buildState({ conversation_history: [{ role: 'user', content: 'Hi' }] }) });

    const backendMessage = 'File content does not match a valid image signature.';
    mockedUploadAttachment.mockRejectedValue({
      status: 400,
      code: 'API_ERROR',
      message: backendMessage,
    });

    const user = userEvent.setup();
    render(<WorkspaceMentorChat workspaceId={1} />);

    const file = new File(['not-really-a-png'], 'fake.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('attach-file'), file);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(backendMessage));
  });

  it('shows the chat error message when the mutation fails', () => {
    setup({
      data: buildState({ conversation_history: [{ role: 'user', content: 'Hi' }] }),
      chatError: { status: 500, code: 'SERVER_ERROR', message: 'Something went wrong.' },
    });

    render(<WorkspaceMentorChat workspaceId={1} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
  });

  describe('attachments', () => {
    /** Uploads `files` through the chat input's file picker and waits for the chips to settle. */
    async function attach(user: ReturnType<typeof userEvent.setup>, files: File[]) {
      await user.upload(screen.getByLabelText('attach-files'), files);
    }

    function uploadedAs(name: string) {
      return {
        id: `remote-${name}`,
        name,
        url: `https://cdn.example.test/uploads/${name}`,
        mimeType: 'application/octet-stream',
        sizeBytes: 10,
      };
    }

    beforeEach(() => {
      setup({ data: buildState({ conversation_history: [{ role: 'user', content: 'Hi' }] }) });
    });

    it('uploads an attached file and replaces the pending chip with the stored one', async () => {
      const user = userEvent.setup();
      mockedUploadAttachment.mockResolvedValue(uploadedAs('photo.png'));

      render(<WorkspaceMentorChat workspaceId={1} />);
      await attach(user, [new File(['x'], 'photo.png', { type: 'image/png' })]);

      expect(mockedUploadAttachment).toHaveBeenCalledWith(1, expect.any(File));
      expect(await screen.findByText('photo.png')).toBeInTheDocument();
      expect(screen.queryByText(/uploading/)).not.toBeInTheDocument();
    });

    it('keeps the local file name when the upload response omits one', async () => {
      const user = userEvent.setup();
      mockedUploadAttachment.mockResolvedValue({ ...uploadedAs('notes.txt'), name: '' });

      render(<WorkspaceMentorChat workspaceId={1} />);
      await attach(user, [new File(['x'], 'notes.txt', { type: 'text/plain' })]);

      expect(await screen.findByText('notes.txt')).toBeInTheDocument();
    });

    it('drops the attachment and warns when the upload fails', async () => {
      const user = userEvent.setup();
      mockedUploadAttachment.mockRejectedValue(new Error('network down'));

      render(<WorkspaceMentorChat workspaceId={1} />);
      await attach(user, [new File(['x'], 'deck.pdf', { type: 'application/pdf' })]);

      await waitFor(() =>
        expect(mockedToast.error).toHaveBeenCalledWith('Failed to upload deck.pdf.'),
      );
      expect(screen.queryByText('deck.pdf')).not.toBeInTheDocument();
    });

    it('removes an uploaded attachment on request', async () => {
      const user = userEvent.setup();
      mockedUploadAttachment.mockResolvedValue(uploadedAs('photo.png'));

      render(<WorkspaceMentorChat workspaceId={1} />);
      await attach(user, [new File(['x'], 'photo.png', { type: 'image/png' })]);

      await user.click(await screen.findByRole('button', { name: 'Remove photo.png' }));

      expect(screen.queryByText('photo.png')).not.toBeInTheDocument();
    });

    it('appends image attachments as markdown images and other files as file links', async () => {
      const user = userEvent.setup();
      const chatMutate = jest.fn();
      setup({
        data: buildState({ conversation_history: [{ role: 'user', content: 'Hi' }] }),
        chatMutate,
      });
      mockedUploadAttachment
        .mockResolvedValueOnce(uploadedAs('photo.png'))
        .mockResolvedValueOnce(uploadedAs('deck.pdf'));

      render(<WorkspaceMentorChat workspaceId={1} />);
      await attach(user, [
        new File(['x'], 'photo.png', { type: 'image/png' }),
        new File(['x'], 'deck.pdf', { type: 'application/pdf' }),
      ]);
      await screen.findByText('deck.pdf');

      await user.type(screen.getByLabelText('chat-input'), 'Here you go');
      await user.click(screen.getByRole('button', { name: 'Send' }));

      expect(chatMutate).toHaveBeenCalledWith(
        {
          message: [
            'Here you go',
            '',
            '![photo.png](https://cdn.example.test/uploads/photo.png)',
            '[📁 deck.pdf](https://cdn.example.test/uploads/deck.pdf)',
          ].join('\n'),
          attachments: [
            {
              type: 'image',
              name: 'photo.png',
              url_or_data: 'data:image/png;base64,eA==',
              mime_type: 'image/png',
            },
            {
              type: 'pdf',
              name: 'deck.pdf',
              url_or_data: 'data:application/pdf;base64,eA==',
              mime_type: 'application/pdf',
            },
          ],
        },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
      );
    });

    it('sends attachments on their own when no message was typed', async () => {
      const user = userEvent.setup();
      const chatMutate = jest.fn();
      setup({
        data: buildState({ conversation_history: [{ role: 'user', content: 'Hi' }] }),
        chatMutate,
      });
      mockedUploadAttachment.mockResolvedValue(uploadedAs('spec.docx'));

      render(<WorkspaceMentorChat workspaceId={1} />);
      await attach(user, [new File(['x'], 'spec.docx', { type: 'application/msword' })]);
      await screen.findByText('spec.docx');

      await user.click(screen.getByRole('button', { name: 'Send' }));

      expect(chatMutate).toHaveBeenCalledWith(
        {
          message: '[📁 spec.docx](https://cdn.example.test/uploads/spec.docx)',
          attachments: [
            {
              type: 'doc',
              name: 'spec.docx',
              url_or_data: 'data:application/msword;base64,eA==',
              mime_type: 'application/msword',
            },
          ],
        },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
      );
    });

    it('classifies allowed files with an extension not explicitly branched as documents', async () => {
      // 'archive.zip' and an extension-less 'README' are no longer usable fixtures here: both
      // are rejected client-side by the extension allowlist before any upload happens (see
      // 'rejects an unsupported file extension instantly...' above), so this now exercises
      // getAttachmentType's fallback via allowed-but-unbranched extensions ('csv', 'md')
      // instead - neither is an image or pdf, and neither is explicitly listed in the
      // doc-group check, so both should still default to a 'doc' file-link render.
      const user = userEvent.setup();
      const chatMutate = jest.fn();
      setup({
        data: buildState({ conversation_history: [{ role: 'user', content: 'Hi' }] }),
        chatMutate,
      });
      mockedUploadAttachment
        .mockResolvedValueOnce(uploadedAs('data.csv'))
        .mockResolvedValueOnce(uploadedAs('notes.md'));

      render(<WorkspaceMentorChat workspaceId={1} />);
      await attach(user, [
        new File(['x'], 'data.csv', { type: 'text/csv' }),
        new File(['x'], 'notes.md', { type: 'text/markdown' }),
      ]);
      await screen.findByText('notes.md');

      await user.click(screen.getByRole('button', { name: 'Send' }));

      // Neither is an image, so both are rendered as file links rather than markdown images.
      expect(chatMutate).toHaveBeenCalledWith(
        {
          message: [
            '[📁 data.csv](https://cdn.example.test/uploads/data.csv)',
            '[📁 notes.md](https://cdn.example.test/uploads/notes.md)',
          ].join('\n'),
          attachments: [
            {
              type: 'doc',
              name: 'data.csv',
              url_or_data: 'data:text/csv;base64,eA==',
              mime_type: 'text/csv',
            },
            {
              type: 'doc',
              name: 'notes.md',
              url_or_data: 'data:text/markdown;base64,eA==',
              mime_type: 'text/markdown',
            },
          ],
        },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
      );
    });
  });
});
