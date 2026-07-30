import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactRouterDom from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';

import { useInteractiveQuestions } from '@features/onboarding/hooks';
import InteractiveQuestionsPage from '@pages/InteractiveQuestionsPage';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof ReactRouterDom>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('@features/onboarding/components', () => ({
  InteractiveQuestionsFlow: ({ onCompleted }: { onCompleted?: () => void }) => (
    <button type="button" onClick={onCompleted}>
      Complete flow
    </button>
  ),
}));

jest.mock('@features/onboarding/hooks', () => ({
  useInteractiveQuestions: jest.fn(),
}));

const mockedUseInteractiveQuestions = jest.mocked(useInteractiveQuestions);

function renderPage() {
  return render(
    <MemoryRouter>
      <InteractiveQuestionsPage />
    </MemoryRouter>,
  );
}

describe('InteractiveQuestionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing while the questions are loading', () => {
    mockedUseInteractiveQuestions.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useInteractiveQuestions>);

    const { container } = renderPage();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the interactive questions flow once loaded', () => {
    mockedUseInteractiveQuestions.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useInteractiveQuestions>);

    renderPage();

    expect(screen.getByRole('button', { name: 'Complete flow' })).toBeInTheDocument();
  });

  it('navigates to the dashboard when the flow completes', async () => {
    mockedUseInteractiveQuestions.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useInteractiveQuestions>);

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Complete flow' }));

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
