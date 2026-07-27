import { z } from 'zod';

export const INTERACTIVE_QUESTION_TYPES = ['text', 'radio', 'dropdown', 'multi_select'] as const;

export const INTERACTIVE_QUESTION_TYPE_LABELS: Record<
  (typeof INTERACTIVE_QUESTION_TYPES)[number],
  string
> = {
  text: 'Short text',
  radio: 'Single choice',
  dropdown: 'Dropdown',
  multi_select: 'Multiple choice',
};

export const createInteractiveQuestionSchema = z
  .object({
    question: z.string().trim().min(1, 'Question title is required'),
    question_type: z.enum(INTERACTIVE_QUESTION_TYPES),
    optional: z.boolean(),
    options: z.array(z.object({ value: z.string().trim().min(1, 'Option cannot be empty') })),
  })
  .refine((data) => data.question_type === 'text' || data.options.length >= 2, {
    message: 'Add at least 2 options for this question type',
    path: ['options'],
  });

export type CreateInteractiveQuestionFormValues = z.infer<typeof createInteractiveQuestionSchema>;
