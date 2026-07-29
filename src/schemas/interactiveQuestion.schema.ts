import { z } from 'zod';

export const INTERACTIVE_QUESTION_TYPES = [
  'textarea',
  'radiobuttons',
  'checkboxes',
  'dropdown',
] as const;

export const INTERACTIVE_QUESTION_TYPE_LABELS: Record<
  (typeof INTERACTIVE_QUESTION_TYPES)[number],
  string
> = {
  textarea: 'Short text',
  radiobuttons: 'Single choice',
  checkboxes: 'Multiple choice',
  dropdown: 'Dropdown',
};

export const createInteractiveQuestionSchema = z
  .object({
    question: z.string().trim().min(1, 'Question title is required'),
    answer_type: z.enum(INTERACTIVE_QUESTION_TYPES),
    optional: z.boolean(),
    options: z.array(z.object({ value: z.string().trim().min(1, 'Option cannot be empty') })),
  })
  .refine((data) => data.answer_type === 'textarea' || data.options.length >= 2, {
    message: 'Add at least 2 options for this question type',
    path: ['options'],
  });

export type CreateInteractiveQuestionFormValues = z.infer<typeof createInteractiveQuestionSchema>;
