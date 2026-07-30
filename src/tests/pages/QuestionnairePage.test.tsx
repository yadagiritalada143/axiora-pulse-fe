import { render, screen } from '@testing-library/react';

import { useInteractiveQuestions } from '@features/onboarding/hooks';
import QuestionnairePage from '@pages/QuestionnairePage';

jest.mock('@features/onboarding/components', () => ({
  InteractiveQuestionsFlow: () => <div data-testid="interactive-questions-flow" />,
}));

jest.mock('@features/onboarding/hooks', () => ({
  useInteractiveQuestions: jest.fn(),
}));

const mockedUseInteractiveQuestions = jest.mocked(useInteractiveQuestions);

describe('QuestionnairePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing while the questions are loading', () => {
    mockedUseInteractiveQuestions.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useInteractiveQuestions>);

    const { container } = render(<QuestionnairePage />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the interactive questions flow once loaded', () => {
    mockedUseInteractiveQuestions.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useInteractiveQuestions>);

    render(<QuestionnairePage />);

    expect(screen.getByTestId('interactive-questions-flow')).toBeInTheDocument();
  });
});
