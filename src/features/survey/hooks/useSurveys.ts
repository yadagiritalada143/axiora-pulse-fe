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

export function usePublicSurvey(token: string) {
  return useQuery({
    queryKey: queryKeys.survey.public(token),
    queryFn: () => surveyService.getPublicSurvey(token),
    enabled: !!token,
  });
}

export function useSubmitPublicSurvey(token: string) {
  return useMutation({
    mutationFn: (payload: SubmitPublicSurveyRequest) =>
      surveyService.submitPublicSurvey(token, payload),
  });
}

export function useSurveyResponses(surveyId: number) {
  return useQuery({
    queryKey: queryKeys.survey.responses(surveyId),
    queryFn: () => surveyService.getSurveyResponses(surveyId),
    enabled: !!surveyId,
  });
}

export function useSurveyAnalysis(surveyId: number) {
  return useQuery({
    queryKey: queryKeys.survey.analysis(surveyId),
    queryFn: () => surveyService.getSurveyAnalysis(surveyId),
    enabled: !!surveyId,
  });
}

export function useRunSurveyAnalysis(surveyId: number, workspaceId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => surveyService.runSurveyAnalysis(surveyId),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.survey.analysis(surveyId), data);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.survey.analysis(surveyId),
      });
      if (workspaceId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.survey.byWorkspace(workspaceId),
        });
      }
    },
  });
}
