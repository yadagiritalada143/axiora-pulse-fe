export type InteractiveQuestionType = 'textarea' | 'radiobuttons' | 'checkboxes' | 'dropdown';

export interface InteractiveQuestion {
  id: number;
  question: string;
  answer_type: InteractiveQuestionType;
  optional: boolean;
  answers: string[];

  created_at: string;
  updated_at: string;
}

export interface InteractiveAnswerPayload {
  questionnaire_id: number;
  user_answers: string[];
}

export type InteractiveAnswerDraft = Record<number, string[]>;

export interface CreateInteractiveQuestionPayload {
  question: string;
  answer_type: InteractiveQuestionType;
  optional: boolean;
  answers: string[];
}

export interface SubmitInteractiveAnswersResponse {
  message: string;
}
