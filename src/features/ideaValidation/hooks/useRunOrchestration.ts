import { useMutation } from '@tanstack/react-query';

import type { OrchestrationRunRequest } from '@/types/orchestration.types';
import { orchestrationService } from '@services/orchestration/orchestration.service';

export function useRunOrchestration() {
  return useMutation({
    mutationFn: (payload: OrchestrationRunRequest) => orchestrationService.run(payload),
  });
}
