import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import { chatService } from '@services/chat';

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.chat.conversations(),
    queryFn: () => chatService.listConversations(),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modelId: string) => chatService.createConversation(modelId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    },
  });
}
