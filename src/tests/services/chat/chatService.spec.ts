import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';
import { chatService } from '@services/chat/chat.service';
import { streamChatCompletion } from '@services/chat/streamClient';

jest.mock('@services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@services/chat/streamClient', () => ({
  streamChatCompletion: jest.fn(),
}));

const {
  get,
  post,
  delete: del,
} = apiClient as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  delete: jest.Mock;
};

describe('chatService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('listConversations unwraps the data', async () => {
    get.mockResolvedValue({ data: { data: [{ id: 'c1' }] } });
    const result = await chatService.listConversations();
    expect(get).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.CONVERSATIONS);
    expect(result).toEqual([{ id: 'c1' }]);
  });

  it('getConversation fetches by id', async () => {
    get.mockResolvedValue({ data: { data: { id: 'c1' } } });
    const result = await chatService.getConversation('c1');
    expect(get).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.CONVERSATION('c1'));
    expect(result).toEqual({ id: 'c1' });
  });

  it('createConversation posts the model id', async () => {
    post.mockResolvedValue({ data: { data: { id: 'c2' } } });
    const result = await chatService.createConversation('model-1');
    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.CONVERSATIONS, { modelId: 'model-1' });
    expect(result).toEqual({ id: 'c2' });
  });

  it('deleteConversation deletes by id', async () => {
    del.mockResolvedValue({ data: {} });
    await chatService.deleteConversation('c1');
    expect(del).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.CONVERSATION('c1'));
  });

  it('listMessages fetches for a conversation', async () => {
    get.mockResolvedValue({ data: { data: [{ id: 'm1' }] } });
    const result = await chatService.listMessages('c1');
    expect(get).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.MESSAGES('c1'));
    expect(result).toEqual([{ id: 'm1' }]);
  });

  it('sendMessage posts the payload', async () => {
    post.mockResolvedValue({ data: { data: { id: 'm2' } } });
    const payload = { conversationId: 'c1', content: 'hi' };
    const result = await chatService.sendMessage(payload);
    expect(post).toHaveBeenCalledWith(API_ENDPOINTS.CHAT.MESSAGES('c1'), payload);
    expect(result).toEqual({ id: 'm2' });
  });

  it('streamMessage delegates to streamChatCompletion', () => {
    const payload = { conversationId: 'c1', content: 'hi' };
    const signal = new AbortController().signal;

    chatService.streamMessage(payload, signal);

    expect(streamChatCompletion).toHaveBeenCalledWith(
      API_ENDPOINTS.CHAT.STREAM('c1'),
      payload,
      signal,
    );
  });

  it('listModels fetches models', async () => {
    get.mockResolvedValue({ data: { data: [{ id: 'gpt' }] } });
    const result = await chatService.listModels();
    expect(get).toHaveBeenCalledWith('/chat/models');
    expect(result).toEqual([{ id: 'gpt' }]);
  });
});
