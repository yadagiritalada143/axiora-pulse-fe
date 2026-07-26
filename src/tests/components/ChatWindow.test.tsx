import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AIModel, ChatMessage, Conversation } from '@/types/chat.types';
import { ChatWindow } from '@features/ai/components/ChatWindow';
import {
  useConversations,
  useCreateConversation,
  useMessages,
  useModels,
  useSendMessage,
} from '@features/ai/hooks';
import { useChatStore } from '@store/chat.store';

jest.mock('@features/ai/hooks', () => ({
  useConversations: jest.fn(),
  useCreateConversation: jest.fn(),
  useMessages: jest.fn(),
  useModels: jest.fn(),
  useSendMessage: jest.fn(),
}));

// `@components/chat` pulls in `react-markdown` (ESM-only, un-transformed by the default Jest
// config) via MarkdownRenderer. ChatWindow's own composition logic doesn't depend on how those
// leaf components render internally, so stand in lightweight test doubles for them here.
jest.mock('@components/chat', () => ({
  ConversationList: ({
    conversations,
    onSelect,
    onCreate,
  }: {
    conversations: Conversation[];
    activeConversationId: string | null;
    onSelect: (id: string) => void;
    onCreate: () => void;
  }) => (
    <div>
      <span>Conversations</span>
      <button type="button" onClick={onCreate}>
        New conversation
      </button>
      {conversations.map((conversation) => (
        <button key={conversation.id} type="button" onClick={() => onSelect(conversation.id)}>
          {conversation.title}
        </button>
      ))}
    </div>
  ),
  ModelSelector: () => <div>Model selector</div>,
  ChatLoader: () => <div data-testid="chat-loader">Loading…</div>,
  UserMessage: ({ message }: { message: ChatMessage }) => <p data-role="user">{message.content}</p>,
  AIMessage: ({ message }: { message: ChatMessage }) => (
    <p data-role="assistant">{message.content}</p>
  ),
  ChatInput: ({
    value,
    onChange,
    onSubmit,
    disabled,
  }: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
  }) => (
    <div>
      <textarea
        aria-label="Message"
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

// jsdom doesn't implement scrollIntoView; ChatWindow calls it on every message-list update.
Element.prototype.scrollIntoView = jest.fn();

const mockedUseConversations = useConversations as jest.Mock;
const mockedUseCreateConversation = useCreateConversation as jest.Mock;
const mockedUseMessages = useMessages as jest.Mock;
const mockedUseModels = useModels as jest.Mock;
const mockedUseSendMessage = useSendMessage as jest.Mock;

const CONVERSATION: Conversation = {
  id: 'c1',
  title: 'Inventory AI',
  modelId: 'model-1',
  lastMessagePreview: 'Hello there',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const MODEL: AIModel = {
  id: 'model-1',
  label: 'GPT Pulse',
  provider: 'openai',
  description: 'General purpose model',
  isDefault: true,
};

const USER_MESSAGE: ChatMessage = {
  id: 'm1',
  conversationId: 'c1',
  role: 'user',
  content: 'What should I validate first?',
  attachments: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const ASSISTANT_MESSAGE: ChatMessage = {
  id: 'm2',
  conversationId: 'c1',
  role: 'assistant',
  content: 'Start with your riskiest assumption.',
  attachments: [],
  createdAt: '2026-01-01T00:00:05.000Z',
  updatedAt: '2026-01-01T00:00:05.000Z',
};

interface SetupOptions {
  conversations?: Conversation[];
  conversationsLoading?: boolean;
  models?: AIModel[];
  messages?: ChatMessage[];
  messagesLoading?: boolean;
  messagesError?: unknown;
  sendMessageMutate?: jest.Mock;
  sendMessagePending?: boolean;
  createConversationMutate?: jest.Mock;
}

function setup({
  conversations = [],
  conversationsLoading = false,
  models = [],
  messages = [],
  messagesLoading = false,
  messagesError = null,
  sendMessageMutate = jest.fn(),
  sendMessagePending = false,
  createConversationMutate = jest.fn(),
}: SetupOptions = {}) {
  mockedUseConversations.mockReturnValue({
    data: conversations,
    isLoading: conversationsLoading,
  });
  mockedUseModels.mockReturnValue({ data: models });
  mockedUseMessages.mockReturnValue({
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  });
  mockedUseSendMessage.mockReturnValue({
    mutate: sendMessageMutate,
    isPending: sendMessagePending,
  });
  mockedUseCreateConversation.mockReturnValue({ mutate: createConversationMutate });
}

describe('ChatWindow', () => {
  afterEach(() => {
    jest.clearAllMocks();
    useChatStore.setState({
      activeConversationId: null,
      selectedModelId: null,
      draftMessage: '',
      draftAttachments: [],
      isStreaming: false,
    });
  });

  it('renders the conversation list and the empty-state prompt when nothing is active', () => {
    setup({ conversations: [CONVERSATION], models: [MODEL] });

    render(<ChatWindow />);

    expect(screen.getByText('Conversations')).toBeInTheDocument();
    expect(screen.getByText('Inventory AI')).toBeInTheDocument();
    expect(
      screen.getByText('Select or start a conversation to begin chatting with your AI co-founder.'),
    ).toBeInTheDocument();
  });

  it('renders messages for the active conversation', () => {
    useChatStore.setState({ activeConversationId: 'c1' });
    setup({
      conversations: [CONVERSATION],
      models: [MODEL],
      messages: [USER_MESSAGE, ASSISTANT_MESSAGE],
    });

    render(<ChatWindow />);

    expect(screen.getByText('What should I validate first?')).toBeInTheDocument();
    expect(screen.getByText('Start with your riskiest assumption.')).toBeInTheDocument();
  });

  it('shows a loading indicator while conversations or messages are loading', () => {
    setup({ conversationsLoading: true });

    render(<ChatWindow />);

    expect(screen.getByTestId('chat-loader')).toBeInTheDocument();
  });

  it('shows an API error message when loading messages fails', () => {
    useChatStore.setState({ activeConversationId: 'c1' });
    setup({
      messagesError: { status: 500, code: 'SERVER_ERROR', message: 'Could not load messages.' },
    });

    render(<ChatWindow />);

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load messages.');
  });

  it('sends the trimmed draft message and clears the draft on submit', async () => {
    useChatStore.setState({ activeConversationId: 'c1', draftMessage: 'Hello there  ' });
    const sendMessageMutate = jest.fn();
    setup({ conversations: [CONVERSATION], sendMessageMutate });

    const user = userEvent.setup();
    render(<ChatWindow />);

    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(sendMessageMutate).toHaveBeenCalledWith('Hello there');
    expect(useChatStore.getState().draftMessage).toBe('');
  });

  it('creates a new conversation with the selected model and activates it on success', async () => {
    useChatStore.setState({ selectedModelId: 'model-1' });
    const createConversationMutate = jest.fn(
      (_modelId, options: { onSuccess: (c: Conversation) => void }) => {
        options.onSuccess(CONVERSATION);
      },
    );
    setup({ models: [MODEL], createConversationMutate });

    const user = userEvent.setup();
    render(<ChatWindow />);

    await user.click(screen.getByRole('button', { name: 'New conversation' }));

    expect(createConversationMutate).toHaveBeenCalledWith(
      'model-1',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(useChatStore.getState().activeConversationId).toBe('c1');
  });
});
