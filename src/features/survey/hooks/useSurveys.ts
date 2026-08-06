import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { surveyService } from '../api/survey.service';
import type { SubmitPublicSurveyRequest, UpdateWorkspaceSurveyQuestionsRequest } from '../types';

export function useSurveyByWorkspace(workspaceId: number) {
  return useQuery({
    queryKey: queryKeys.survey.byWorkspace(workspaceId),
    queryFn: () => surveyService.getSurveyByWorkspaceId(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useUpdateWorkspaceSurveyQuestions(workspaceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWorkspaceSurveyQuestionsRequest) =>
      surveyService.updateWorkspaceSurveyQuestions(workspaceId, payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.survey.byWorkspace(workspaceId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.detail(workspaceId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.state(workspaceId),
      });
    },
  });
}

export function usePublicSurvey(surveyId: number) {
  return useQuery({
    queryKey: queryKeys.survey.public(surveyId),
    queryFn: () => surveyService.getPublicSurvey(surveyId),
    enabled: !!surveyId,
  });
}

export function useSubmitPublicSurvey(surveyId: number) {
  return useMutation({
    mutationFn: (payload: SubmitPublicSurveyRequest) =>
      surveyService.submitPublicSurvey(surveyId, payload),
  });
}

export function useSurveyResponses(surveyId: number) {
  return useQuery({
    queryKey: queryKeys.survey.responses(surveyId),
    queryFn: () => surveyService.getSurveyResponses(surveyId),
    enabled: !!surveyId,
  });
}
