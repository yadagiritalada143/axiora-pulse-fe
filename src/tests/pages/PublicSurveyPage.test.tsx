import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { usePublicSurvey, useSubmitPublicSurvey } from '@features/survey/hooks/useSurveys';
import type { PublicSurveyDetailResponse, SubmitPublicSurveyRequest } from '@features/survey/types';
import PublicSurveyPage from '@pages/PublicSurveyPage';

jest.mock('@features/survey/hooks/useSurveys', () => ({
  usePublicSurvey: jest.fn(),
  useSubmitPublicSurvey: jest.fn(),
}));

// The dropdown question renders a Radix Select, whose positioning relies on
// ResizeObserver — a browser API jsdom doesn't implement.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

const mockedUsePublicSurvey = usePublicSurvey as jest.Mock;
const mockedUseSubmitPublicSurvey = useSubmitPublicSurvey as jest.Mock;

const survey: PublicSurveyDetailResponse = {
  surveyId: 'abc123token',
  workspaceName: 'Acme Labs',
  questions: [
    { id: 1, question: 'What is your biggest challenge?', questionType: 'text', options: [] },
    { id: 2, question: 'How often does it happen?', questionType: 'radio', options: ['Daily'] },
    { id: 3, question: 'Which tools do you use?', questionType: 'checkbox', options: ['Excel'] },
    { id: 4, question: 'What is your role?', questionType: 'dropdown', options: ['Founder'] },
  ],
};

interface MutateOptions {
  onSuccess?: () => void;
}
type Mutate = (payload: SubmitPublicSurveyRequest, options?: MutateOptions) => void;

function mockSubmit(overrides: { mutate?: Mutate; isPending?: boolean; error?: Error } = {}) {
  const mutate = overrides.mutate ?? jest.fn();
  mockedUseSubmitPublicSurvey.mockReturnValue({
    mutate,
    isPending: overrides.isPending ?? false,
    error: overrides.error ?? null,
  });
  return mutate;
}

/** Runs `mutate` straight down its success path so the thank-you screen renders. */
const succeedingMutate: Mutate = (_payload, options) => options?.onSuccess?.();

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/surveys/public/abc123token']}>
      <Routes>
        <Route path="/surveys/public/:surveyId" element={<PublicSurveyPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicSurveyPage', () => {
  beforeEach(() => {
    mockedUsePublicSurvey.mockReturnValue({ data: survey, isLoading: false, isError: false });
    mockSubmit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reads the survey id from the route and passes it to the hooks', () => {
    renderPage();

    expect(mockedUsePublicSurvey).toHaveBeenCalledWith('abc123token');
    expect(mockedUseSubmitPublicSurvey).toHaveBeenCalledWith('abc123token');
  });

  it('shows a loading state while the survey is being fetched', () => {
    mockedUsePublicSurvey.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    renderPage();

    expect(screen.getByText('Loading survey questions...')).toBeInTheDocument();
  });

  it('shows a not-found card when the survey request errors', () => {
    mockedUsePublicSurvey.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    renderPage();

    expect(screen.getByText('Survey Not Found')).toBeInTheDocument();
  });

  it('shows a not-found card when the survey resolves to nothing', () => {
    mockedUsePublicSurvey.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    renderPage();

    expect(screen.getByText('Survey Not Found')).toBeInTheDocument();
  });

  it('renders the workspace name and first question type in interactive mode', () => {
    renderPage();

    expect(screen.getByText('Acme Labs')).toBeInTheDocument();
    expect(screen.getByText('What is your biggest challenge?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your answer here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('navigates through questions with Next and Back buttons', async () => {
    const user = userEvent.setup();
    renderPage();

    // Step 0: Question 1 (text)
    expect(screen.getByText('What is your biggest challenge?')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Type your answer here...'), 'Churn');
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Step 1: Question 2 (radio)
    expect(await screen.findByText('How often does it happen?')).toBeInTheDocument();
    expect(await screen.findByText('Daily')).toBeInTheDocument();
    await user.click(await screen.findByText('Daily'));

    // Test Back button
    await user.click(screen.getByRole('button', { name: /Back/i }));
    expect(await screen.findByText('What is your biggest challenge?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your answer here...')).toHaveValue('Churn');

    // Go forward again
    await user.click(screen.getByRole('button', { name: /Next/i }));
    expect(await screen.findByText('How often does it happen?')).toBeInTheDocument();
  });

  it('renders fallback for unsupported question type', () => {
    mockedUsePublicSurvey.mockReturnValue({
      data: {
        ...survey,
        questions: [
          {
            id: 9,
            question: 'Unsupported question',
            questionType: 'ranking' as never,
            options: [],
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(screen.getByText('Unsupported question')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Type your answer here...')).not.toBeInTheDocument();
  });

  it('submits the text, radio, checkbox, dropdown and email answers across interactive steps', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockSubmit({ mutate });

    renderPage();

    // Step 0: Question 1 (Text)
    await user.type(screen.getByPlaceholderText('Type your answer here...'), 'Churn');
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Step 1: Question 2 (Radio)
    await user.click(await screen.findByText('Daily'));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Step 2: Question 3 (Checkbox)
    await user.click(await screen.findByText('Excel'));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Step 3: Question 4 (Dropdown)
    await user.click(await screen.findByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 4: Final Email & Submit Step
    await user.type(await screen.findByLabelText(/Your Email Address/), 'me@example.test');
    await user.click(screen.getByRole('button', { name: /Submit Response/i }));

    expect(mutate).toHaveBeenCalledWith(
      {
        respondentEmail: 'me@example.test',
        answers: [
          { questionId: 1, answer: 'Churn' },
          { questionId: 2, answer: 'Daily' },
          { questionId: 3, answer: ['Excel'] },
          { questionId: 4, answer: 'Founder' },
        ],
      },
      expect.any(Object),
    );
  });

  it('shows an error when trying to advance past a mandatory question without answering', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockSubmit({ mutate });

    renderPage();

    // Try to click Next without answering mandatory text question
    await user.click(screen.getByRole('button', { name: /Next/i }));

    expect(mutate).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Please provide an answer for this required question/i),
    ).toBeInTheDocument();
  });

  it('records the selected dropdown option and submits when all questions answered', async () => {
    mockedUsePublicSurvey.mockReturnValue({
      data: {
        ...survey,
        questions: [
          { id: 4, question: 'What is your role?', questionType: 'dropdown', options: ['Founder'] },
        ],
      },
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockSubmit({ mutate });

    renderPage();

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: /Continue/i }));

    // Final step
    await user.click(screen.getByRole('button', { name: /Submit Response/i }));

    expect(mutate).toHaveBeenCalledWith(
      { respondentEmail: undefined, answers: [{ questionId: 4, answer: 'Founder' }] },
      expect.any(Object),
    );
  });

  it('shows the thank-you screen once the submission succeeds', async () => {
    mockedUsePublicSurvey.mockReturnValue({
      data: {
        ...survey,
        questions: [{ id: 1, question: 'Question 1', questionType: 'text', options: [] }],
      },
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();
    mockSubmit({ mutate: jest.fn(succeedingMutate) });

    renderPage();

    await user.type(screen.getByPlaceholderText('Type your answer here...'), 'My Answer');
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await user.click(screen.getByRole('button', { name: /Submit Response/i }));

    expect(screen.getByText('Thank You!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Submit Response/i })).not.toBeInTheDocument();
  });

  it('disables the submit button and shows progress while submitting', async () => {
    mockedUsePublicSurvey.mockReturnValue({
      data: {
        ...survey,
        questions: [{ id: 1, question: 'Question 1', questionType: 'text', options: [] }],
      },
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();
    mockSubmit({ isPending: true });

    renderPage();

    await user.type(screen.getByPlaceholderText('Type your answer here...'), 'My Answer');
    await user.click(screen.getByRole('button', { name: /Continue/i }));

    expect(screen.getByRole('button', { name: /Submitting/ })).toBeDisabled();
  });

  it('surfaces the submission error message', async () => {
    mockedUsePublicSurvey.mockReturnValue({
      data: {
        ...survey,
        questions: [{ id: 1, question: 'Question 1', questionType: 'text', options: [] }],
      },
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();
    mockSubmit({ error: new Error('Answers are invalid') });

    renderPage();

    await user.type(screen.getByPlaceholderText('Type your answer here...'), 'My Answer');
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await user.click(screen.getByRole('button', { name: /Submit Response/i }));

    expect(mockedUseSubmitPublicSurvey).toHaveBeenCalled();
  });

  it('allows submitting the survey when optional questions are skipped', async () => {
    mockedUsePublicSurvey.mockReturnValue({
      data: {
        ...survey,
        questions: [
          { id: 1, question: 'Required question', questionType: 'text', options: [] },
          { id: 2, question: 'Optional feedback (Optional)', questionType: 'text', options: [] },
        ],
      },
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();
    const mutate = jest.fn(succeedingMutate);
    mockSubmit({ mutate });
    renderPage();

    // Required question 1
    await user.type(screen.getByPlaceholderText('Type your answer here...'), 'Mandatory answer');
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Optional question 2 -> click Continue without answering
    await user.click(screen.getByRole('button', { name: /Continue/i }));

    // Final step
    await user.click(screen.getByRole('button', { name: /Submit Response/i }));

    expect(mutate).toHaveBeenCalledWith(
      {
        respondentEmail: undefined,
        answers: [{ questionId: 1, answer: 'Mandatory answer' }],
      },
      expect.any(Object),
    );
    expect(screen.getByText('Thank You!')).toBeInTheDocument();
  });
});
