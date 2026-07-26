// Mocked apiClient methods are passed bare to `expect(...)` throughout this file;
// typescript-eslint can't tell these are jest.fn()s rather than real bound methods.

import type { AIModel, ChatMessage, Conversation, SendMessagePayload } from '@/types/chat.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';
import { chatService } from '@services/chat/chat.service';

// See auth.service.test.ts for why this mocks the barrel directly rather than spreading
// `jest.requireActual` - the real client.ts pulls in `import.meta.env`, which Jest can't evaluate.
jest.mock('@services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

// chat.service imports streamClient, which reads `appConfig` directly (bypassing the mocked
// barrel above) - it also pulls in `import.meta.env` unless stubbed here.
jest.mock('@config/app.config', () => ({
  appConfig: {
    apiUrl: 'https://api.test.local',
    aiStreaming: true,
    request: { timeoutMs: 1000 },
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const conversation: Conversation = {
  id: 'c1',
  title: 'New chat',
  modelId: 'model-1',
  lastMessagePreview: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const message: ChatMessage = {
  id: 'm1',
  conversationId: 'c1',
  role: 'assistant',
  content: 'Hello',
  attachments: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('chatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('listConversations fetches and unwraps the ApiResponse envelope', async () => {
    mockedApiClient.get.mockResolvedValue({ data: { success: true, data: [conversation] } });

    const result = await chatService.listConversations();

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.CONVERSATIONS);
    expect(result).toEqual([conversation]);
  });

  it('getConversation fetches a single conversation by id', async () => {
    mockedApiClient.get.mockResolvedValue({ data: { success: true, data: conversation } });

    const result = await chatService.getConversation('c1');

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.CONVERSATION('c1'));
    expect(result).toBe(conversation);
  });

  it('createConversation posts the model id and returns the created conversation', async () => {
    mockedApiClient.post.mockResolvedValue({ data: { success: true, data: conversation } });

    const result = await chatService.createConversation('model-1');

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.CONVERSATIONS, {
      modelId: 'model-1',
    });
    expect(result).toBe(conversation);
  });

  it('deleteConversation deletes by id', async () => {
    mockedApiClient.delete.mockResolvedValue({ data: undefined });

    await chatService.deleteConversation('c1');

    expect(mockedApiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.CONVERSATION('c1'));
  });

  it('listMessages fetches and unwraps the ApiResponse envelope', async () => {
    mockedApiClient.get.mockResolvedValue({ data: { success: true, data: [message] } });

    const result = await chatService.listMessages('c1');

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.MESSAGES('c1'));
    expect(result).toEqual([message]);
  });

  it('sendMessage posts the payload and returns the created message', async () => {
    const payload: SendMessagePayload = { conversationId: 'c1', content: 'Hi there' };
    mockedApiClient.post.mockResolvedValue({ data: { success: true, data: message } });

    const result = await chatService.sendMessage(payload);

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.MESSAGES('c1'), payload);
    expect(result).toBe(message);
  });

  it('listModels fetches available models from the hardcoded models endpoint', async () => {
    const models: AIModel[] = [
      { id: 'model-1', label: 'Model One', provider: 'acme', description: '', isDefault: true },
    ];
    mockedApiClient.get.mockResolvedValue({ data: { success: true, data: models } });

    const result = await chatService.listModels();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/chat/models');
    expect(result).toBe(models);
  });

  it('streamMessage delegates to the streaming transport for the conversation, without touching apiClient', () => {
    const payload: SendMessagePayload = { conversationId: 'c1', content: 'Hi there' };

    const generator = chatService.streamMessage(payload);

    expect(typeof generator.next).toBe('function');
    expect(mockedApiClient.post).not.toHaveBeenCalled();
    expect(mockedApiClient.get).not.toHaveBeenCalled();
  });
});
