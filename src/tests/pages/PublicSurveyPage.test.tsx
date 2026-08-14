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
  surveyId: 5,
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
    <MemoryRouter initialEntries={['/surveys/public/5']}>
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

    expect(mockedUsePublicSurvey).toHaveBeenCalledWith(5);
    expect(mockedUseSubmitPublicSurvey).toHaveBeenCalledWith(5);
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

  it('renders the workspace name and every question type', () => {
    renderPage();

    expect(screen.getByText('Acme Labs')).toBeInTheDocument();
    expect(screen.getByText('What is your biggest challenge?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your answer here...')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Daily' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Excel' })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders nothing for a question type it does not recognise', () => {
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

  it('submits the text, radio, checkbox and email answers the respondent provided', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockSubmit({ mutate });

    renderPage();

    await user.type(screen.getByPlaceholderText('Type your answer here...'), 'Churn');
    await user.click(screen.getByRole('radio', { name: 'Daily' }));
    await user.click(screen.getByRole('checkbox', { name: 'Excel' }));
    await user.type(screen.getByLabelText(/Your Email Address/), 'me@example.test');
    await user.click(screen.getByRole('button', { name: 'Submit Response' }));

    expect(mutate).toHaveBeenCalledWith(
      {
        respondentEmail: 'me@example.test',
        answers: [
          { questionId: 1, answer: 'Churn' },
          { questionId: 2, answer: 'Daily' },
          { questionId: 3, answer: ['Excel'] },
        ],
      },
      expect.any(Object),
    );
  });

  it('removes a checkbox option from the answer when it is unchecked again', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockSubmit({ mutate });

    renderPage();

    const checkbox = screen.getByRole('checkbox', { name: 'Excel' });
    await user.click(checkbox);
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Submit Response' }));

    expect(mutate).toHaveBeenCalledWith(
      { respondentEmail: undefined, answers: [{ questionId: 3, answer: [] }] },
      expect.any(Object),
    );
  });

  it('records the selected dropdown option', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockSubmit({ mutate });

    renderPage();

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Founder' }));
    await user.click(screen.getByRole('button', { name: 'Submit Response' }));

    expect(mutate).toHaveBeenCalledWith(
      { respondentEmail: undefined, answers: [{ questionId: 4, answer: 'Founder' }] },
      expect.any(Object),
    );
  });

  it('omits a blank email rather than submitting an empty string', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn();
    mockSubmit({ mutate });

    renderPage();

    await user.type(screen.getByLabelText(/Your Email Address/), '   ');
    await user.click(screen.getByRole('button', { name: 'Submit Response' }));

    expect(mutate).toHaveBeenCalledWith(
      { respondentEmail: undefined, answers: [] },
      expect.any(Object),
    );
  });

  it('shows the thank-you screen once the submission succeeds', async () => {
    const user = userEvent.setup();
    mockSubmit({ mutate: jest.fn(succeedingMutate) });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Submit Response' }));

    expect(screen.getByText('Thank You!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit Response' })).not.toBeInTheDocument();
  });

  it('disables the submit button and shows progress while submitting', () => {
    mockSubmit({ isPending: true });

    renderPage();

    expect(screen.getByRole('button', { name: /Submitting/ })).toBeDisabled();
  });

  it('surfaces the submission error message', () => {
    mockSubmit({ error: new Error('Answers are invalid') });

    renderPage();

    expect(screen.getByText('Answers are invalid')).toBeInTheDocument();
  });

  it('falls back to generic copy when the submission error has no message', () => {
    mockSubmit({ error: new Error('') });

    renderPage();

    expect(screen.getByText('Failed to submit response. Please check inputs.')).toBeInTheDocument();
  });
});
