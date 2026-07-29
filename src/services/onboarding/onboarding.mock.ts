import type { InteractiveQuestion } from '@/types/onboarding.types';

const TIMESTAMP = '2025-01-01T00:00:00.000Z';

export const MOCK_INTERACTIVE_QUESTIONS: InteractiveQuestion[] = [
  {
    id: 1,
    question: 'What should I call you?',
    answer_type: 'textarea',
    optional: false,
    answers: [],
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: 2,
    question: 'What best describes your role?',
    answer_type: 'radiobuttons',
    optional: false,
    answers: ['Founder', 'Co-founder', 'Product Manager', 'Engineer'],
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: 3,
    question: 'Which industry is your idea in?',
    answer_type: 'dropdown',
    optional: false,
    answers: ['SaaS', 'E-commerce', 'Fintech', 'Healthtech', 'Edtech'],
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: 4,
    question: 'What stage is your idea at?',
    answer_type: 'radiobuttons',
    optional: true,
    answers: ['Just an idea', 'Building an MVP', 'Have paying customers', 'Scaling'],
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: 5,
    question: 'What are you hoping to get out of Axiora Pulse?',
    answer_type: 'checkboxes',
    optional: true,
    answers: [
      'Validate my idea',
      'Find co-founders',
      'Build a roadmap',
      'Raise funding',
      'Get mentorship',
    ],
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: 6,
    question: 'Anything else you want your AI Mentor to know?',
    answer_type: 'textarea',
    optional: true,
    answers: [],
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
];
