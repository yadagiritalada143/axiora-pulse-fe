import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useSurveyByWorkspace,
  useSurveyResponses,
  useUpdateWorkspaceSurveyQuestions,
} from '@features/survey/hooks/useSurveys';
import type {
  SurveyResponse,
  SurveyResponsesListResponse,
  UpdateWorkspaceSurveyQuestionsRequest,
} from '@features/survey/types';
import { useWorkspaceState } from '@features/workspace/hooks/useWorkspaceMentor';
import { useWorkspace } from '@features/workspace/hooks/useWorkspaces';
import type { Workspace } from '@features/workspace/types';
import WorkspaceSurveyPage from '@pages/WorkspaceSurveyPage';

// The page only uses MentorShell as app-shell chrome (it has its own test); stub it to a
// passthrough so this suite doesn't drag in auth hooks/stores that aren't under test here.
jest.mock('@features/ideaValidation/components', () => ({
  MentorShell: ({
    children,
    navSectionLabel,
  }: {
    children: ReactNode;
    navSectionLabel: string;
  }) => (
    <div>
      <span data-testid="nav-section-label">{navSectionLabel}</span>
      {children}
    </div>
  ),
}));

jest.mock('@features/survey/hooks/useSurveys', () => ({
  useSurveyByWorkspace: jest.fn(),
  useSurveyResponses: jest.fn(),
  useUpdateWorkspaceSurveyQuestions: jest.fn(),
}));

jest.mock('@features/workspace/hooks/useWorkspaces', () => ({
  useWorkspace: jest.fn(),
}));

jest.mock('@features/workspace/hooks/useWorkspaceMentor', () => ({
  useWorkspaceState: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// The question-type dropdown renders a Radix Select, whose positioning relies on
// ResizeObserver — a browser API jsdom doesn't implement.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

const mockedUseWorkspace = useWorkspace as jest.Mock;
const mockedUseWorkspaceState = useWorkspaceState as jest.Mock;
const mockedUseSurveyByWorkspace = useSurveyByWorkspace as jest.Mock;
const mockedUseSurveyResponses = useSurveyResponses as jest.Mock;
const mockedUseUpdateSurvey = useUpdateWorkspaceSurveyQuestions as jest.Mock;
const mockedToast = toast as jest.Mocked<typeof toast>;

const workspace: Workspace = {
  id: 42,
  user_id: 1,
  name: 'Acme Labs',
  description: 'A workspace',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
};

const survey: SurveyResponse = {
  id: 5,
  user_id: 1,
  workspace_id: 42,
  public_token: 'abc123token',
  survey_link: null,
  questions: [
    { id: 1, question: 'What is your biggest challenge?', questionType: 'text', options: [] },
    { id: 2, question: 'How often?', questionType: 'radio', options: ['Daily', 'Weekly'] },
  ],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
};

const noResponses: SurveyResponsesListResponse = {
  survey_id: 5,
  total_responses: 0,
  responses: [],
};

interface MutateOptions {
  onSuccess?: () => void;
  onError?: () => void;
}
type Mutate = (payload: UpdateWorkspaceSurveyQuestionsRequest, options?: MutateOptions) => void;

function mockUpdate(overrides: { mutate?: Mutate; isPending?: boolean } = {}) {
  const mutate = overrides.mutate ?? jest.fn();
  mockedUseUpdateSurvey.mockReturnValue({ mutate, isPending: overrides.isPending ?? false });
  return mutate;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/workspaces/42/survey']}>
      <Routes>
        <Route path="/workspaces/:workspaceId/survey" element={<WorkspaceSurveyPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

/** The editor renders one card per question; scope queries to avoid cross-question matches. */
function questionCard(index: number) {
  const cards = document.querySelectorAll('[data-question-card]');
  return within(cards[index] as HTMLElement);
}

describe('WorkspaceSurveyPage', () => {
  beforeEach(() => {
    mockedUseWorkspace.mockReturnValue({ data: workspace, isLoading: false, isError: false });
    mockedUseWorkspaceState.mockReturnValue({ data: undefined });
    mockedUseSurveyByWorkspace.mockReturnValue({
      data: survey,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockedUseSurveyResponses.mockReturnValue({ data: noResponses, isLoading: false });
    mockUpdate();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('load states', () => {
    it('shows a spinner while the workspace is loading', () => {
      mockedUseWorkspace.mockReturnValue({ data: undefined, isLoading: true, isError: false });

      const { container } = renderPage();

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows a spinner while the survey is loading', () => {
      mockedUseSurveyByWorkspace.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      });

      const { container } = renderPage();

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows a not-found message when the workspace cannot be loaded', () => {
      mockedUseWorkspace.mockReturnValue({ data: undefined, isLoading: false, isError: true });

      renderPage();

      expect(screen.getByText('Workspace not found')).toBeInTheDocument();
      expect(screen.getByTestId('nav-section-label')).toHaveTextContent('Workspace');
    });

    it('prompts the user to run validation when the survey has not been generated yet', () => {
      mockedUseSurveyByWorkspace.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { status: 404 },
      });

      renderPage();

      expect(screen.getByText('No survey generated yet')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Go to AI Mentor' })).toHaveAttribute(
        'href',
        '/workspace/42',
      );
    });

    it('treats an axios 404 the same as a normalized 404', () => {
      const axiosError = new AxiosError('Not Found');
      axiosError.response = {
        status: 404,
        statusText: 'Not Found',
        data: {},
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      mockedUseSurveyByWorkspace.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: axiosError,
      });

      renderPage();

      expect(screen.getByText('No survey generated yet')).toBeInTheDocument();
    });

    it('shows a generic failure message for a non-404 survey error', () => {
      mockedUseSurveyByWorkspace.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { status: 500 },
      });

      renderPage();

      expect(screen.getByText('Failed to load survey')).toBeInTheDocument();
    });

    it('shows a generic failure message when the survey resolves to nothing', () => {
      mockedUseSurveyByWorkspace.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      });

      renderPage();

      expect(screen.getByText('Failed to load survey')).toBeInTheDocument();
    });
  });

  describe('share link', () => {
    it('renders the public survey URL and copies it to the clipboard', async () => {
      const user = userEvent.setup();
      const writeText = jest.fn().mockResolvedValue(undefined);
      // `userEvent.setup()` installs its own getter-only `navigator.clipboard` stub, so this
      // has to be redefined rather than assigned over.
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
      });

      renderPage();

      expect(screen.getByText('Your survey is live!')).toBeInTheDocument();

      await user.click(screen.getByTitle('Copy link'));

      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/surveys/public/abc123token`,
      );
      expect(mockedToast.success).toHaveBeenCalledWith('Survey link copied to clipboard!');
    });

    it('hides the share card when the survey has no id yet', () => {
      mockedUseSurveyByWorkspace.mockReturnValue({
        data: { ...survey, public_token: '' },
        isLoading: false,
        isError: false,
        error: null,
      });

      renderPage();

      expect(screen.queryByText('Your survey is live!')).not.toBeInTheDocument();
    });
  });

  describe('question editor', () => {
    it('seeds the editor from the fetched survey questions', () => {
      renderPage();

      expect(screen.getByText('Questions (2)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('What is your biggest challenge?')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Daily')).toBeInTheDocument();
    });

    it('shows the empty state when the survey has no questions', () => {
      mockedUseSurveyByWorkspace.mockReturnValue({
        data: { ...survey, questions: [] },
        isLoading: false,
        isError: false,
        error: null,
      });

      renderPage();

      expect(screen.getByText('No questions in this survey yet.')).toBeInTheDocument();
    });

    it('adds a first question from the empty state', async () => {
      const user = userEvent.setup();
      mockedUseSurveyByWorkspace.mockReturnValue({
        data: { ...survey, questions: [] },
        isLoading: false,
        isError: false,
        error: null,
      });

      renderPage();

      await user.click(screen.getByRole('button', { name: /Add your first question/ }));

      expect(screen.getByText('Questions (1)')).toBeInTheDocument();
      expect(mockedToast.success).toHaveBeenCalledWith('Question added!');
    });

    it('scrolls the newly added question into view and focuses it', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const scrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoView;

      renderPage();

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      jest.runOnlyPendingTimers();

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
      jest.useRealTimers();
    });

    it('edits a question’s text', async () => {
      const user = userEvent.setup();
      renderPage();

      const input = screen.getByDisplayValue('What is your biggest challenge?');
      await user.clear(input);
      await user.type(input, 'What hurts most?');

      expect(screen.getByDisplayValue('What hurts most?')).toBeInTheDocument();
    });

    it('reveals the options editor when a question becomes a choice type', async () => {
      const user = userEvent.setup();
      renderPage();

      expect(questionCard(0).queryByText('Answer Options')).not.toBeInTheDocument();

      await user.click(questionCard(0).getByRole('combobox'));
      await user.click(await screen.findByRole('option', { name: 'Checkboxes (Multi Select)' }));

      expect(questionCard(0).getByText('Answer Options')).toBeInTheDocument();
    });

    it('adds, edits and removes answer options', async () => {
      const user = userEvent.setup();
      renderPage();

      const radioCard = questionCard(1);

      await user.click(radioCard.getByRole('button', { name: /Add Option/ }));
      expect(screen.getByDisplayValue('Option 3')).toBeInTheDocument();

      const optionInput = screen.getByDisplayValue('Option 3');
      await user.clear(optionInput);
      await user.type(optionInput, 'Monthly');
      expect(screen.getByDisplayValue('Monthly')).toBeInTheDocument();

      const removeButtons = radioCard.getAllByTitle('Remove option');
      const removeThirdOption = removeButtons[removeButtons.length - 1];
      if (!removeThirdOption) throw new Error('Expected a remove button for the third option');

      await user.click(removeThirdOption);
      expect(screen.queryByDisplayValue('Monthly')).not.toBeInTheDocument();
    });

    it('does not allow removing an option below the two-option minimum', () => {
      renderPage();

      for (const button of questionCard(1).getAllByTitle('Remove option')) {
        expect(button).toBeDisabled();
      }
    });

    it('reorders questions with the move up and move down controls', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(questionCard(0).getByTitle('Move down'));
      expect(questionCard(0).getByDisplayValue('How often?')).toBeInTheDocument();

      await user.click(questionCard(1).getByTitle('Move up'));
      expect(
        questionCard(0).getByDisplayValue('What is your biggest challenge?'),
      ).toBeInTheDocument();
    });

    it('disables the move controls at the ends of the list', () => {
      renderPage();

      expect(questionCard(0).getByTitle('Move up')).toBeDisabled();
      expect(questionCard(1).getByTitle('Move down')).toBeDisabled();
    });

    it('cancels a question deletion without changing the list', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(questionCard(0).getByTitle('Delete question'));
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.getByText('Questions (2)')).toBeInTheDocument();
    });

    it('closes the delete dialog when it is dismissed with Escape', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(questionCard(0).getByTitle('Delete question'));
      expect(screen.getByText('Delete Question')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByText('Delete Question')).not.toBeInTheDocument();
      expect(screen.getByText('Questions (2)')).toBeInTheDocument();
    });

    it('deletes a question after confirmation', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(questionCard(0).getByTitle('Delete question'));
      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(screen.getByText('Questions (1)')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('What is your biggest challenge?')).not.toBeInTheDocument();
      expect(mockedToast.success).toHaveBeenCalledWith('Question deleted successfully!');
    });
  });

  describe('saving', () => {
    it('rejects a save when a question has no text', async () => {
      const user = userEvent.setup();
      const mutate = mockUpdate();
      renderPage();

      await user.clear(screen.getByDisplayValue('What is your biggest challenge?'));
      await user.click(screen.getByRole('button', { name: /Save & Publish Survey/ }));

      expect(mockedToast.error).toHaveBeenCalledWith('Question 1 text cannot be empty.');
      expect(mutate).not.toHaveBeenCalled();
    });

    it('rejects a save when a choice question has fewer than two options', async () => {
      const user = userEvent.setup();
      mockedUseSurveyByWorkspace.mockReturnValue({
        data: {
          ...survey,
          questions: [{ id: 2, question: 'How often?', questionType: 'radio', options: ['Daily'] }],
        },
        isLoading: false,
        isError: false,
        error: null,
      });
      const mutate = mockUpdate();
      renderPage();

      await user.click(screen.getByRole('button', { name: /Save & Publish Survey/ }));

      expect(mockedToast.error).toHaveBeenCalledWith(
        'Question 1 (radio) must have at least 2 options.',
      );
      expect(mutate).not.toHaveBeenCalled();
    });

    it('sends trimmed text questions with a null options list', async () => {
      const user = userEvent.setup();
      const mutate = mockUpdate();
      renderPage();

      await user.click(screen.getByRole('button', { name: /Save & Publish Survey/ }));

      expect(mutate).toHaveBeenCalledWith(
        {
          questions: [
            {
              question_text: 'What is your biggest challenge?',
              question_type: 'text',
              target_hypothesis: null,
              options: null,
            },
            {
              question_text: 'How often?',
              question_type: 'radio',
              target_hypothesis: null,
              options: ['Daily', 'Weekly'],
            },
          ],
        },
        expect.any(Object),
      );
    });

    it('toasts on a successful save', async () => {
      const user = userEvent.setup();
      mockUpdate({ mutate: jest.fn((_payload, options) => options?.onSuccess?.()) });
      renderPage();

      await user.click(screen.getByRole('button', { name: /Save & Publish Survey/ }));

      expect(mockedToast.success).toHaveBeenCalledWith(
        'Survey updated and published successfully!',
      );
    });

    it('toasts when the save fails', async () => {
      const user = userEvent.setup();
      mockUpdate({ mutate: jest.fn((_payload, options) => options?.onError?.()) });
      renderPage();

      await user.click(screen.getByRole('button', { name: /Save & Publish Survey/ }));

      expect(mockedToast.error).toHaveBeenCalledWith(
        'Failed to update survey questions. Please try again.',
      );
    });

    it('disables the save button while the mutation is in flight', () => {
      mockUpdate({ isPending: true });

      renderPage();

      expect(screen.getByRole('button', { name: /Saving/ })).toBeDisabled();
    });
  });

  describe('responses tab', () => {
    const response = {
      id: 11,
      survey_id: 5,
      respondent_email: 'person@example.test',
      answers: [
        { questionId: 1, answer: 'It takes too long' },
        { questionId: 2, answer: ['Daily', 'Weekly'] },
      ],
      submitted_at: '2026-01-03T00:00:00.000Z',
    };

    async function openResponsesTab(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('tab', { name: /Responses/ }));
    }

    it('requests responses for the loaded survey and shows the count in the tab', () => {
      mockedUseSurveyResponses.mockReturnValue({
        data: { ...noResponses, total_responses: 3 },
        isLoading: false,
      });

      renderPage();

      expect(mockedUseSurveyResponses).toHaveBeenCalledWith(5);
      expect(screen.getByRole('tab', { name: 'Responses (3)' })).toBeInTheDocument();
    });

    it('falls back to survey id 0 before the survey has loaded', () => {
      mockedUseSurveyByWorkspace.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      });

      renderPage();

      expect(mockedUseSurveyResponses).toHaveBeenCalledWith(0);
    });

    it('shows a spinner while responses are loading', async () => {
      const user = userEvent.setup();
      mockedUseSurveyResponses.mockReturnValue({ data: undefined, isLoading: true });

      const { container } = renderPage();
      await openResponsesTab(user);

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows an empty state when nothing has been collected', async () => {
      const user = userEvent.setup();
      renderPage();
      await openResponsesTab(user);

      expect(screen.getByText('No responses recorded yet.')).toBeInTheDocument();
    });

    it('lists collected responses and opens the answer detail dialog', async () => {
      const user = userEvent.setup();
      mockedUseSurveyResponses.mockReturnValue({
        data: { survey_id: 5, total_responses: 1, responses: [response] },
        isLoading: false,
      });

      renderPage();
      await openResponsesTab(user);

      expect(screen.getByText('person@example.test')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'View Answers' }));

      const dialog = within(screen.getByRole('dialog'));
      expect(dialog.getByText('Survey Response Detail')).toBeInTheDocument();
      expect(dialog.getByText('It takes too long')).toBeInTheDocument();
      expect(dialog.getByText('Daily, Weekly')).toBeInTheDocument();
    });

    it('closes the answer detail dialog when it is dismissed with Escape', async () => {
      const user = userEvent.setup();
      mockedUseSurveyResponses.mockReturnValue({
        data: { survey_id: 5, total_responses: 1, responses: [response] },
        isLoading: false,
      });

      renderPage();
      await openResponsesTab(user);
      await user.click(screen.getByRole('button', { name: 'View Answers' }));
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('labels an anonymous respondent in both the table and the dialog', async () => {
      const user = userEvent.setup();
      mockedUseSurveyResponses.mockReturnValue({
        data: {
          survey_id: 5,
          total_responses: 1,
          responses: [{ ...response, respondent_email: null }],
        },
        isLoading: false,
      });

      renderPage();
      await openResponsesTab(user);

      expect(screen.getByText('Anonymous')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'View Answers' }));

      expect(within(screen.getByRole('dialog')).getByText('Anonymous')).toBeInTheDocument();
    });

    it('renders numeric, object and missing answers in the detail dialog', async () => {
      const user = userEvent.setup();
      mockedUseSurveyResponses.mockReturnValue({
        data: {
          survey_id: 5,
          total_responses: 1,
          responses: [
            {
              ...response,
              answers: [
                { questionId: 1, answer: 7 },
                { questionId: 2, answer: { rating: 'high' } },
              ],
            },
          ],
        },
        isLoading: false,
      });

      renderPage();
      await openResponsesTab(user);
      await user.click(screen.getByRole('button', { name: 'View Answers' }));

      const dialog = within(screen.getByRole('dialog'));
      expect(dialog.getByText('7')).toBeInTheDocument();
      expect(dialog.getByText('{"rating":"high"}')).toBeInTheDocument();
    });

    it('shows placeholder copy for a question the respondent skipped', async () => {
      const user = userEvent.setup();
      mockedUseSurveyResponses.mockReturnValue({
        data: {
          survey_id: 5,
          total_responses: 1,
          responses: [{ ...response, answers: [{ questionId: 1, answer: '   ' }] }],
        },
        isLoading: false,
      });

      renderPage();
      await openResponsesTab(user);
      await user.click(screen.getByRole('button', { name: 'View Answers' }));

      expect(within(screen.getByRole('dialog')).getAllByText('No response provided')).toHaveLength(
        2,
      );
    });
  });
});
