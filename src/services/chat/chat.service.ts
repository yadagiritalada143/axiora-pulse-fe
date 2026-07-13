import type { AIModel, ChatMessage, Conversation, SendMessagePayload } from '@/types/chat.types';
import type { ApiResponse } from '@/types/response.types';
import { API_ENDPOINTS } from '@constants/api';
import { apiClient } from '@services/api';

import { streamChatCompletion } from './streamClient';

export const chatService = {
  async listConversations(): Promise<Conversation[]> {
    const { data } = await apiClient.get<ApiResponse<Conversation[]>>(
      API_ENDPOINTS.CHAT.CONVERSATIONS,
    );
    return data.data;
  },

  async getConversation(conversationId: string): Promise<Conversation> {
    const { data } = await apiClient.get<ApiResponse<Conversation>>(
      API_ENDPOINTS.CHAT.CONVERSATION(conversationId),
    );
    return data.data;
  },

  async createConversation(modelId: string): Promise<Conversation> {
    const { data } = await apiClient.post<ApiResponse<Conversation>>(
      API_ENDPOINTS.CHAT.CONVERSATIONS,
      { modelId },
    );
    return data.data;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CHAT.CONVERSATION(conversationId));
  },

  async listMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data } = await apiClient.get<ApiResponse<ChatMessage[]>>(
      API_ENDPOINTS.CHAT.MESSAGES(conversationId),
    );
    return data.data;
  },

  /** Non-streaming send, used as a fallback when `VITE_AI_STREAMING` is disabled. */
  async sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
    const { data } = await apiClient.post<ApiResponse<ChatMessage>>(
      API_ENDPOINTS.CHAT.MESSAGES(payload.conversationId),
      payload,
    );
    return data.data;
  },

  /** Streams the assistant's reply chunk by chunk. See `streamClient` for the transport. */
  streamMessage(payload: SendMessagePayload, signal?: AbortSignal) {
    return streamChatCompletion(API_ENDPOINTS.CHAT.STREAM(payload.conversationId), payload, signal);
  },

  async listModels(): Promise<AIModel[]> {
    const { data } = await apiClient.get<ApiResponse<AIModel[]>>('/chat/models');
    return data.data;
  },
};
