import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { OrchestrationResult } from '@/types/orchestration.types';
import { WorkspaceMentorChat } from '@features/workspace/components/WorkspaceMentorChat';
import {
  useResetWorkspaceMentor,
  useWorkspaceChat,
  useWorkspaceState,
} from '@features/workspace/hooks/useWorkspaceMentor';
import type { WorkspaceStateResponse } from '@features/workspace/types';

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
  ChatInput: ({
    value,
    onChange,
    onSubmit,
    disabled,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
    placeholder?: string;
  }) => (
    <div>
      <textarea
        aria-label="chat-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <button type="button" onClick={onSubmit} disabled={disabled}>
        Send
      </button>
    </div>
  ),
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

    expect(chatMutate).toHaveBeenCalledWith({ message: 'My idea', attachments: null });
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
    expect(chatMutate).toHaveBeenCalledWith({
      message: 'Run validation analysis',
      attachments: null,
    });

    await user.click(verifyDetailsButton);
    expect(chatMutate).toHaveBeenCalledWith({
      message: 'Can you verify and summarize the idea details you have so far?',
      attachments: null,
    });
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

    expect(chatMutate).toHaveBeenCalledWith({ message: 'What next?', attachments: null });
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

  it('shows the chat error message when the mutation fails', () => {
    setup({
      data: buildState({ conversation_history: [{ role: 'user', content: 'Hi' }] }),
      chatError: { status: 500, code: 'SERVER_ERROR', message: 'Something went wrong.' },
    });

    render(<WorkspaceMentorChat workspaceId={1} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
  });
});
