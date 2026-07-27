export type InteractiveQuestionType = 'text' | 'radio' | 'dropdown' | 'multi_select';

export interface InteractiveQuestion {
  id: number;
  questionId: number;
  question: string;
  question_type: InteractiveQuestionType;
  optional: boolean;
  answers?: string[];
}

export interface InteractiveAnswerPayload {
  interactive_question_ID: number;
  answer: string[];
}

export type InteractiveAnswerDraft = Record<number, string[]>;

export interface CreateInteractiveQuestionPayload {
  question: string;
  question_type: InteractiveQuestionType;
  optional: boolean;
  answers?: string[];
}
