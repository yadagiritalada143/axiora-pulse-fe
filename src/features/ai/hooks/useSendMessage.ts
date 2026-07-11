import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { ChatMessage } from '@/types/chat.types';
import { isApiError } from '@/types/error.types';
import { appConfig } from '@config/app.config';
import { queryKeys } from '@constants/queryKeys';
import { chatService } from '@services/chat';
import { useChatStore } from '@store/chat.store';

function appendMessage(messages: ChatMessage[] | undefined, message: ChatMessage): ChatMessage[] {
  return [...(messages ?? []), message];
}

function patchMessage(
  messages: ChatMessage[] | undefined,
  id: string,
  patch: Partial<ChatMessage>,
): ChatMessage[] | undefined {
  return messages?.map((message) => (message.id === id ? { ...message, ...patch } : message));
}

/**
 * Sends a message and, when `VITE_AI_STREAMING` is on, appends the
 * assistant's reply to the query cache chunk by chunk as it streams in -
 * otherwise falls back to a single non-streaming response.
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const setIsStreaming = useChatStore((state) => state.setIsStreaming);
  const messagesKey = queryKeys.chat.messages(conversationId);

  return useMutation({
    mutationFn: async (content: string) => {
      const now = new Date().toISOString();
      const userMessage: ChatMessage = {
        id: `local-${crypto.randomUUID()}`,
        conversationId,
        role: 'user',
        content,
        attachments: [],
        createdAt: now,
        updatedAt: now,
      };
      const assistantMessage: ChatMessage = {
        id: `local-${crypto.randomUUID()}`,
        conversationId,
        role: 'assistant',
        content: '',
        attachments: [],
        createdAt: now,
        updatedAt: now,
        isStreaming: true,
      };

      queryClient.setQueryData<ChatMessage[]>(messagesKey, (previous) =>
        appendMessage(appendMessage(previous, userMessage), assistantMessage),
      );
      setIsStreaming(true);

      try {
        if (appConfig.aiStreaming) {
          for await (const chunk of chatService.streamMessage({ conversationId, content })) {
            queryClient.setQueryData<ChatMessage[]>(messagesKey, (previous) =>
              patchMessage(previous, assistantMessage.id, {
                content:
                  (previous?.find((m) => m.id === assistantMessage.id)?.content ?? '') +
                  chunk.delta,
                isStreaming: !chunk.done,
              }),
            );
          }
        } else {
          const reply = await chatService.sendMessage({ conversationId, content });
          queryClient.setQueryData<ChatMessage[]>(messagesKey, (previous) =>
            patchMessage(previous, assistantMessage.id, { ...reply, isStreaming: false }),
          );
        }
      } finally {
        setIsStreaming(false);
      }
    },
    onError: (error) => {
      toast.error(
        isApiError(error) ? error.message : 'The assistant could not respond. Please retry.',
      );
    },
  });
}
