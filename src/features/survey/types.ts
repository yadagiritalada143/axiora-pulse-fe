export interface SurveyQuestionItem {
  id: number;
  question: string;
  questionType: 'text' | 'radio' | 'checkbox' | 'dropdown';
  options: string[];
}

export interface SurveyResponse {
  id: number;
  user_id: number;
  workspace_id: number;
  survey_link: string | null;
  questions: SurveyQuestionItem[];
  created_at: string;
  updated_at: string;
}

export interface SurveyListResponse {
  total: number;
  surveys: SurveyResponse[];
}

export interface PublicAnswerItem {
  questionId: number;
  answer: string | string[];
}

export interface SubmitPublicSurveyRequest {
  respondentEmail?: string;
  answers: PublicAnswerItem[];
}

export interface SubmitPublicSurveyResponse {
  status: string;
  message: string;
  responseId: number;
}

export interface PublicSurveyDetailResponse {
  surveyId: number;
  workspaceName: string;
  questions: SurveyQuestionItem[];
}

export interface SingleSurveyResponseItem {
  id: number;
  survey_id: number;
  respondent_email: string | null;
  answers: { questionId: number; answer: unknown }[];
  submitted_at: string;
}

export interface SurveyResponsesListResponse {
  survey_id: number;
  total_responses: number;
  responses: SingleSurveyResponseItem[];
}

export interface WorkspaceSurveyQuestionItem {
  question_text: string;
  question_type: string;
  target_hypothesis?: string | null;
  options?: string[] | null;
}

export interface UpdateWorkspaceSurveyQuestionsRequest {
  survey_title?: string;
  survey_objective?: string;
  questions: WorkspaceSurveyQuestionItem[];
}

export interface UpdateWorkspaceSurveyQuestionsResponse {
  status: string;
  message: string;
  workspace_id: number;
  survey_title?: string | null;
  survey_objective?: string | null;
  questions: WorkspaceSurveyQuestionItem[];
}
