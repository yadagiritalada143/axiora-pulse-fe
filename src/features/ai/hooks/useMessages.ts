import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import { chatService } from '@services/chat';

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: queryKeys.chat.messages(conversationId ?? ''),
    queryFn: () => chatService.listMessages(conversationId ?? ''),
    enabled: Boolean(conversationId),
  });
}
