import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { InteractiveSurveyQuestions } from '@/features/ideaValidation/components/InteractiveSurveyQuestions';
import type { SurveyIntelligenceQuestion } from '@/types/orchestration.types';

const MOCK_QUESTIONS: SurveyIntelligenceQuestion[] = [
  {
    question_text: 'How frequently do you encounter supply chain disruptions?',
    question_type: 'single_choice',
    target_hypothesis: 'Disruptions happen weekly for over 50% of managers',
  },
  {
    question_text: 'Which inventory management features are critical to your team?',
    question_type: 'multiple_choice',
    target_hypothesis: 'Real-time alerting is prioritized over reporting',
  },
  {
    question_text: 'Describe your primary frustration with existing ERP software.',
    question_type: 'text',
    target_hypothesis: 'Legacy software has high latency and complex UX',
  },
];

describe('InteractiveSurveyQuestions', () => {
  it('renders the interactive question card with the first question and progress indicator', () => {
    render(
      <MemoryRouter>
        <InteractiveSurveyQuestions questions={MOCK_QUESTIONS} workspaceId={1} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    expect(
      screen.getByText('How frequently do you encounter supply chain disruptions?'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('navigates through questions with Next and Back buttons', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <InteractiveSurveyQuestions questions={MOCK_QUESTIONS} workspaceId={1} />
      </MemoryRouter>,
    );

    // Click Next -> Question 2
    const nextBtn1 = screen.getAllByRole('button', { name: /next/i }).pop();
    if (!nextBtn1) throw new Error('Next button not found');
    await user.click(nextBtn1);
    expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
    expect(
      screen.getByText('Which inventory management features are critical to your team?'),
    ).toBeInTheDocument();
    const backBtn1 = screen.getAllByRole('button', { name: /back/i }).pop();
    expect(backBtn1).toBeEnabled();

    // Click Next -> Question 3 (Final)
    const nextBtn2 = screen.getAllByRole('button', { name: /next/i }).pop();
    if (!nextBtn2) throw new Error('Next button not found');
    await user.click(nextBtn2);
    expect(screen.getByText('Question 3 of 3')).toBeInTheDocument();
    expect(
      screen.getByText('Describe your primary frustration with existing ERP software.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to survey/i })).toBeInTheDocument();

    // Click Back -> Question 2
    const backBtn2 = screen.getAllByRole('button', { name: /back/i }).pop();
    if (!backBtn2) throw new Error('Back button not found');
    await user.click(backBtn2);
    expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
  });

  it('displays the AI validation hypothesis for the active question', () => {
    render(
      <MemoryRouter>
        <InteractiveSurveyQuestions questions={MOCK_QUESTIONS} workspaceId={1} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Validation Hypothesis')).toBeInTheDocument();
    expect(
      screen.getByText('Disruptions happen weekly for over 50% of managers'),
    ).toBeInTheDocument();
  });
});
