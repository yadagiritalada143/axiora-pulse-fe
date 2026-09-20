import { apiClient } from '@/services/api';
import type {
  AdminUserFeedbackFilterParams,
  AdminUserFeedbackListResponse,
  CreateFeedbackQuestionPayload,
  FeedbackQuestion,
  FeedbackQuestionnaireListResponse,
  UpdateFeedbackQuestionPayload,
  UserFeedbackSubmitPayload,
  UserFeedbackSubmitResult,
} from '@/types/feedback.types';
import { API_ENDPOINTS } from '@constants/api';

export const feedbackService = {
  listAdminQuestions: async (): Promise<FeedbackQuestion[]> => {
    const { data } = await apiClient.get<FeedbackQuestion[]>(
      API_ENDPOINTS.FEEDBACK.ADMIN_QUESTIONS,
    );
    return data;
  },

  createQuestion: async (payload: CreateFeedbackQuestionPayload): Promise<FeedbackQuestion> => {
    const { data } = await apiClient.post<FeedbackQuestion>(
      API_ENDPOINTS.FEEDBACK.ADMIN_QUESTIONS,
      payload,
    );
    return data;
  },

  updateQuestion: async (
    questionId: number,
    payload: UpdateFeedbackQuestionPayload,
  ): Promise<FeedbackQuestion> => {
    const { data } = await apiClient.put<FeedbackQuestion>(
      API_ENDPOINTS.FEEDBACK.ADMIN_QUESTION_DETAIL(questionId),
      payload,
    );
    return data;
  },

  listDisplayedQuestions: async (
    isDisplay = true,
    workspaceId?: number,
  ): Promise<FeedbackQuestionnaireListResponse> => {
    const { data } = await apiClient.get<FeedbackQuestionnaireListResponse | FeedbackQuestion[]>(
      API_ENDPOINTS.FEEDBACK.USER_QUESTIONS,
      {
        params: {
          is_display: isDisplay,
          ...(workspaceId ? { workspace_id: workspaceId } : {}),
        },
      },
    );

    if (Array.isArray(data)) {
      return {
        alreadySubmitted: null,
        questions: data,
      };
    }

    return {
      alreadySubmitted: data?.alreadySubmitted ?? null,
      questions: data?.questions ?? [],
    };
  },

  submitFeedback: async (payload: UserFeedbackSubmitPayload): Promise<UserFeedbackSubmitResult> => {
    const response = await apiClient.post<Blob>(API_ENDPOINTS.FEEDBACK.USER_SUBMIT, payload, {
      responseType: 'blob',
      timeout: 60_000,
    });

    const rawBlob = response.data;
    const disposition = response.headers['content-disposition'] as string | undefined;
    let filename = '';

    if (disposition) {
      const filenameStarRegex = /filename\*=UTF-8''([^;]+)/i;
      const filenameStarMatch = filenameStarRegex.exec(disposition);
      if (filenameStarMatch?.[1]) {
        filename = decodeURIComponent(filenameStarMatch[1]);
      } else {
        const filenameRegex = /filename="?([^";]+)"?/i;
        const filenameMatch = filenameRegex.exec(disposition);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }
    }

    if (!filename) {
      filename = `idea_validation_certificate_${payload.workspace_id}.pdf`;
    } else if (!filename.toLowerCase().endsWith('.pdf')) {
      filename = `${filename}.pdf`;
    }

    return { blob: rawBlob, filename };
  },

  listUserFeedback: async (
    params?: AdminUserFeedbackFilterParams,
  ): Promise<AdminUserFeedbackListResponse> => {
    const { data } = await apiClient.get<AdminUserFeedbackListResponse>(
      API_ENDPOINTS.FEEDBACK.ADMIN_SUBMISSIONS,
      {
        params,
      },
    );
    return data;
  },
};
