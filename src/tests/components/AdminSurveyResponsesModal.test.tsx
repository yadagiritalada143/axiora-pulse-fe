import { render, screen } from '@testing-library/react';

import { AdminSurveyResponsesModal } from '@features/admin/components/AdminSurveyResponsesModal';
import { useAdminSurveyResponses } from '@features/admin/hooks/useAdminSurveyResponses';

jest.mock('@features/admin/hooks/useAdminSurveyResponses', () => ({
  useAdminSurveyResponses: jest.fn(),
}));

jest.mock('@features/admin/hooks/useAdminSurveyResponseDetail', () => ({
  useAdminSurveyResponseDetail: jest.fn(() => ({
    data: undefined,
    isLoading: true,
    isError: false,
  })),
}));

const mockedHook = jest.mocked(useAdminSurveyResponses);

function renderModal(overrides: Record<string, unknown> = {}) {
  const props = {
    surveyId: 2,
    surveyTitle: 'Feedback Survey',
    isOpen: true,
    onClose: jest.fn(),
    ...overrides,
  } as Parameters<typeof AdminSurveyResponsesModal>[0];
  const utils = render(<AdminSurveyResponsesModal {...props} />);
  return { ...utils, props };
}

const baseData = {
  responses: [
    {
      id: 1,
      response_code: 'R1',
      respondent_email: 'r@example.com',
      submitted_at: '2026-01-01T00:00:00Z',
      status: 'Completed',
    },
  ],
  pagination: { total: 1, limit: 10, offset: 0 },
};

describe('AdminSurveyResponsesModal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders loading state', () => {
    mockedHook.mockReturnValue({ data: undefined, isLoading: true, isError: false } as never);
    renderModal();
    expect(screen.getByText('Loading responses...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockedHook.mockReturnValue({ data: undefined, isLoading: false, isError: true } as never);
    renderModal();
    expect(
      screen.getByText('Failed to load responses for this survey. Please try again.'),
    ).toBeInTheDocument();
  });

  it('renders responses and title', () => {
    mockedHook.mockReturnValue({
      data: baseData,
      isLoading: false,
      isError: false,
    } as never);
    renderModal();
    expect(screen.getByText('Survey Responses')).toBeInTheDocument();
    expect(screen.getByText(/Feedback Survey/)).toBeInTheDocument();
    expect(screen.getByText('R1')).toBeInTheDocument();
    expect(screen.getByText('r@example.com')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    mockedHook.mockReturnValue({
      data: { responses: [], pagination: { total: 0, limit: 10, offset: 0 } },
      isLoading: false,
      isError: false,
    } as never);
    renderModal();
    expect(screen.getByText('No responses collected yet for this survey.')).toBeInTheDocument();
  });

  it('renders anonymous respondent when email null', () => {
    mockedHook.mockReturnValue({
      data: {
        responses: [{ ...baseData.responses[0], respondent_email: null }],
        pagination: baseData.pagination,
      },
      isLoading: false,
      isError: false,
    } as never);
    renderModal();
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });
});
