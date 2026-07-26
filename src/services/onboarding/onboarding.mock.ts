import type { InteractiveQuestion } from '@/types/onboarding.types';

export const MOCK_INTERACTIVE_QUESTIONS: InteractiveQuestion[] = [
  {
    id: 1,
    questionId: 101,
    question: 'What should I call you?',
    question_type: 'text',
    optional: false,
  },
  {
    id: 2,
    questionId: 102,
    question: 'What best describes your role?',
    question_type: 'radio',
    optional: false,
    answers: ['Founder', 'Co-founder', 'Product Manager', 'Engineer'],
  },
  {
    id: 3,
    questionId: 103,
    question: 'Which industry is your idea in?',
    question_type: 'dropdown',
    optional: false,
    answers: ['SaaS', 'E-commerce', 'Fintech', 'Healthtech', 'Edtech'],
  },
  {
    id: 4,
    questionId: 104,
    question: 'What stage is your idea at?',
    question_type: 'radio',
    optional: true,
    answers: ['Just an idea', 'Building an MVP', 'Have paying customers', 'Scaling'],
  },
  {
    id: 5,
    questionId: 105,
    question: 'What are you hoping to get out of Axiora Pulse?',
    question_type: 'multi_select',
    optional: true,
    answers: [
      'Validate my idea',
      'Find co-founders',
      'Build a roadmap',
      'Raise funding',
      'Get mentorship',
    ],
  },
  {
    id: 6,
    questionId: 106,
    question: 'Anything else you want your AI Mentor to know?',
    question_type: 'text',
    optional: true,
  },
];
