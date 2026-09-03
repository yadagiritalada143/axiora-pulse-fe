import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { AdminResponseDetailModal } from '@features/admin/components/AdminResponseDetailModal';
import { useAdminSurveyResponseDetail } from '@features/admin/hooks/useAdminSurveyResponseDetail';

jest.mock('@features/admin/hooks/useAdminSurveyResponseDetail', () => ({
  useAdminSurveyResponseDetail: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedHook = jest.mocked(useAdminSurveyResponseDetail);

const baseResponse = {
  id: 7,
  response_code: 'ABC123',
  respondent_email: 'responder@example.com',
  submitted_at: '2026-02-01T10:30:00Z',
  status: 'Completed',
  workspace_name: 'My Survey',
  answers_preview: [
    { question: 'How satisfied?', answer: 5 },
    { question: 'Would you recommend?', answer: true },
    { question: 'Tags', answer: ['a', 'b'] },
    { question: 'Extra', answer: { nested: true } },
    { question: 'Empty', answer: '' },
    { question: 'Long text', answer: 'some long text' },
  ],
};

function renderModal(overrides: Record<string, unknown> = {}) {
  const props = {
    surveyId: 1,
    responseId: 7,
    surveyTitle: 'My Survey',
    isOpen: true,
    onClose: jest.fn(),
    ...overrides,
  } as Parameters<typeof AdminResponseDetailModal>[0];
  const utils = render(<AdminResponseDetailModal {...props} />);
  return { ...utils, props };
}

describe('AdminResponseDetailModal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders loading state', () => {
    mockedHook.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as never);
    renderModal();
    expect(screen.getByText('Loading response details...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockedHook.mockReturnValue({ data: undefined, isLoading: false, isError: true } as never);
    renderModal();
    expect(
      screen.getByText('Failed to load survey response detail. Please try again.'),
    ).toBeInTheDocument();
  });

  it('renders response with various answer formats', () => {
    mockedHook.mockReturnValue({
      data: baseResponse,
      isLoading: false,
      isError: false,
    } as never);
    renderModal();

    expect(screen.getByText('My Survey')).toBeInTheDocument();
    expect(screen.getAllByText('ABC123').length).toBeGreaterThan(0);
    expect(screen.getByText('responder@example.com')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('No response provided')).toBeInTheDocument();
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getByText('some long text')).toBeInTheDocument();
  });

  it('renders anonymous respondent when email is missing', () => {
    mockedHook.mockReturnValue({
      data: { ...baseResponse, respondent_email: null },
      isLoading: false,
      isError: false,
    } as never);
    renderModal();
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('copies response code when copy button clicked', async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    mockedHook.mockReturnValue({
      data: baseResponse,
      isLoading: false,
      isError: false,
    } as never);
    renderModal();

    await user.click(screen.getByRole('button', { name: /ABC123/ }));
    expect(writeText).toHaveBeenCalledWith('ABC123');
    expect(toast.success).toHaveBeenCalledWith('Response code copied to clipboard.');
  });

  it('calls onClose when back button clicked', async () => {
    const user = userEvent.setup();
    mockedHook.mockReturnValue({
      data: baseResponse,
      isLoading: false,
      isError: false,
    } as never);
    const { props } = renderModal();

    await user.click(screen.getByLabelText('Back to responses'));
    expect(props.onClose).toHaveBeenCalled();
  });
});
