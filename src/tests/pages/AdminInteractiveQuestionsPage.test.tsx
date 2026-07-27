import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import AdminInteractiveQuestionsPage from '@pages/AdminInteractiveQuestionsPage';
import { onboardingService } from '@services/onboarding';

// Radix's <Select> observes its trigger size via ResizeObserver, which jsdom doesn't implement.
class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
global.ResizeObserver = MockResizeObserver;

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@services/onboarding', () => ({
  onboardingService: {
    listAllInteractiveQuestions: jest.fn(),
    createInteractiveQuestion: jest.fn(),
    deleteInteractiveQuestion: jest.fn(),
  },
}));

const mockedOnboardingService = jest.mocked(onboardingService);

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return render(<AdminInteractiveQuestionsPage />, { wrapper: Wrapper });
}

describe('AdminInteractiveQuestionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedOnboardingService.listAllInteractiveQuestions.mockResolvedValue([]);
  });

  it('renders the heading, add form, and existing questions list', async () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Interactive Questions' })).toBeInTheDocument();
    expect(screen.getByText('Add a question')).toBeInTheDocument();
    expect(screen.getByText('Existing questions')).toBeInTheDocument();
    expect(await screen.findByText('No questions have been added yet.')).toBeInTheDocument();
  });
});
