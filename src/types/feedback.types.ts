export type FeedbackAnswerType = 'textarea' | 'radiobuttons' | 'checkboxes' | 'dropdown' | 'emoji';

export const STAR_DESCRIPTIONS: Record<number, string> = {
  1: 'Very Dissatisfied',
  2: 'Dissatisfied',
  3: 'Neutral / Average',
  4: 'Satisfied / Good',
  5: 'Excellent / Very Satisfied',
};

export const CUMULATIVE_STAR_OPTIONS = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

export function countStars(val: string): number {
  return (val.match(/⭐/g) ?? []).length;
}

export function isStarQuestion(
  _questionText?: string,
  answers?: string[],
  answerType?: FeedbackAnswerType,
): boolean {
  if (answerType && answerType !== 'emoji') {
    return false;
  }

  const hasStarEmoji = answers?.some((a) => a.includes('⭐')) ?? false;
  if (hasStarEmoji) {
    return true;
  }

  const hasLiteralStarWord = answers?.some((a) => /\b(1|2|3|4|5)\s*stars?\b/i.test(a)) ?? false;
  if (hasLiteralStarWord) {
    return true;
  }

  return false;
}

export const FEEDBACK_ANSWER_TYPES: {
  value: FeedbackAnswerType;
  label: string;
  description: string;
}[] = [
  { value: 'textarea', label: 'Text Area', description: 'Free-form text input' },
  { value: 'radiobuttons', label: 'Single Choice', description: 'Pick one option from a list' },
  { value: 'checkboxes', label: 'Multiple Choice', description: 'Select multiple options' },
  { value: 'dropdown', label: 'Dropdown Menu', description: 'Select one option from a dropdown' },
  { value: 'emoji', label: 'Emoji / Star Rating', description: 'Rating scale or sentiment faces' },
];

export interface FeedbackQuestion {
  id: number;
  question: string;
  answer_type: FeedbackAnswerType;
  optional: boolean;
  answers: string[];
  is_display: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackQuestionnaireListResponse {
  alreadySubmitted: boolean | null;
  questions: FeedbackQuestion[];
}

export interface CreateFeedbackQuestionPayload {
  question: string;
  answer_type: FeedbackAnswerType;
  optional?: boolean;
  answers?: string[];
  is_display?: boolean;
}

export interface UpdateFeedbackQuestionPayload {
  question?: string;
  answer_type?: FeedbackAnswerType;
  optional?: boolean;
  answers?: string[];
  is_display?: boolean;
}

export interface FeedbackAnswerItem {
  questionnaire_id: number;
  user_answers: string[];
}

export interface UserFeedbackSubmitPayload {
  workspace_id: number;
  answers: FeedbackAnswerItem[];
}

export interface UserFeedbackSubmitResult {
  blob: Blob;
  filename: string;
}

export interface AdminUserFeedbackItem {
  id: number;
  user_id: number;
  user_email: string;
  user_display_name: string | null;
  workspace_id: number | null;
  questionnaire_id: number;
  question: string | null;
  user_answers: string[];
  submission_date: string;
}

export interface AdminUserFeedbackPagination {
  total: number;
  limit: number;
  offset: number;
}

export interface AdminUserFeedbackListResponse {
  feedback: AdminUserFeedbackItem[];
  pagination: AdminUserFeedbackPagination;
}

export interface AdminUserFeedbackFilterParams {
  limit?: number;
  offset?: number;
  search?: string;
  user_id?: number;
  date_from?: string;
  date_to?: string;
}
