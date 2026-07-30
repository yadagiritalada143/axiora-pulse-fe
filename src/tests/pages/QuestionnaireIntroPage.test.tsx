import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactRouterDom from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';

import QuestionnaireIntroPage from '@pages/QuestionnaireIntroPage';
import { useAuthStore } from '@store/auth.store';

// jsdom/Babel can't transform a raw .png import (no asset loader is wired into this
// project's Jest config), so stub it out the same way other binary assets would be.
jest.mock('@/assets/images/questionnaire-banner.png', () => 'questionnaire-banner.png', {
  virtual: true,
});

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof ReactRouterDom>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <QuestionnaireIntroPage />
    </MemoryRouter>,
  );
}

describe('QuestionnaireIntroPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ showQuestionnaireIntro: false });
  });

  it('renders the intro heading and copy', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Help AI Mentor Understand Your Idea' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/estimated time/i)).toBeInTheDocument();
  });

  it('hides the intro flag and navigates to the interactive questions on continue', async () => {
    useAuthStore.setState({ showQuestionnaireIntro: true });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(useAuthStore.getState().showQuestionnaireIntro).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/interactive-questions');
  });
});
