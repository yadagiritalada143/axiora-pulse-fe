import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@constants/queryKeys';
import { chatService } from '@services/chat';

export function useModels() {
  return useQuery({
    queryKey: queryKeys.chat.models(),
    queryFn: () => chatService.listModels(),
    staleTime: 10 * 60 * 1000,
  });
}
