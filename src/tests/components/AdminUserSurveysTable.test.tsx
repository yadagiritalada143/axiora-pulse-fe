import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { AdminUserSurveysTable } from '@features/admin/components/AdminUserSurveysTable';
import { useAdminSurveys } from '@features/admin/hooks/useAdminSurveys';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

jest.mock('@features/admin/hooks/useAdminSurveys', () => ({
  useAdminSurveys: jest.fn(),
}));

jest.mock('@features/admin/hooks/useAdminSurveyResponses', () => ({
  useAdminSurveyResponses: jest.fn(() => ({
    data: { responses: [], pagination: { total: 0, limit: 10, offset: 0 } },
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@features/admin/hooks/useAdminSurveyResponseDetail', () => ({
  useAdminSurveyResponseDetail: jest.fn(() => ({
    data: undefined,
    isLoading: true,
    isError: false,
  })),
}));

const mockedHook = jest.mocked(useAdminSurveys);

const mockedToast = toast as jest.Mocked<typeof toast>;

function renderTable() {
  return render(<AdminUserSurveysTable userId={5} userName="John" />);
}

const baseData = {
  surveys: [
    {
      id: 10,
      workspace_name: 'Customer Satisfaction Survey',
      workspace_description: 'Feedback and review collection',
      status: 'Active',
      responses_count: 3,
      created_at: '2026-01-01T00:00:00Z',
      survey_link: '/s/abc',
      question_count: 4,
    },
  ],
  pagination: { total: 1, limit: 10, offset: 0 },
};

describe('AdminUserSurveysTable', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders loading state', () => {
    mockedHook.mockReturnValue({ data: undefined, isLoading: true, isError: false } as never);
    renderTable();
    expect(screen.getByText('Loading surveys...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockedHook.mockReturnValue({ data: undefined, isLoading: false, isError: true } as never);
    renderTable();
    expect(screen.getByText('Failed to load surveys. Please try again.')).toBeInTheDocument();
  });

  it('renders a survey row', () => {
    mockedHook.mockReturnValue({
      data: baseData,
      isLoading: false,
      isError: false,
    } as never);
    renderTable();
    expect(screen.getByText('Surveys Created by John')).toBeInTheDocument();
    expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('January 1, 2026')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    mockedHook.mockReturnValue({
      data: { surveys: [], pagination: { total: 0, limit: 10, offset: 0 } },
      isLoading: false,
      isError: false,
    } as never);
    renderTable();
    expect(screen.getByText('No surveys found for this user.')).toBeInTheDocument();
  });
});

describe('AdminUserSurveysTable themes and interactions', () => {
  function renderWithSurvey(overrides: Partial<(typeof baseData)['surveys'][0]> = {}) {
    const survey = {
      id: 10,
      workspace_name: 'Customer Satisfaction Survey',
      workspace_description: 'General topic area',
      status: 'Active',
      responses_count: 3,
      created_at: '2026-01-01T00:00:00Z',
      survey_link: '/s/abc',
      question_count: 4,
      ...overrides,
    };
    mockedHook.mockReturnValue({
      data: { surveys: [survey], pagination: { total: 1, limit: 10, offset: 0 } },
      isLoading: false,
      isError: false,
    } as never);
    render(<AdminUserSurveysTable userId={5} userName="John" />);
  }

  beforeEach(() => jest.clearAllMocks());

  it('maps product/feature names to the product theme', () => {
    renderWithSurvey({ workspace_name: 'Product Feature Survey' });
    expect(document.querySelector('.lucide-package')).not.toBeNull();
  });

  it('maps onboarding/journey names to the onboarding theme', () => {
    renderWithSurvey({ workspace_name: 'Onboarding Experience' });
    expect(document.querySelector('.lucide-compass')).not.toBeNull();
  });

  it('maps market/validation names to the market theme', () => {
    renderWithSurvey({ workspace_name: 'Market Validation Study' });
    expect(document.querySelector('.lucide-chart-column')).not.toBeNull();
  });

  it('maps security/risk names to the security theme', () => {
    renderWithSurvey({ workspace_name: 'Security Risk Audit' });
    expect(document.querySelector('.lucide-shield-check')).not.toBeNull();
  });

  it('maps customer/user names to the customer theme', () => {
    renderWithSurvey({ workspace_name: 'Customer Discovery' });
    expect(document.querySelector('.lucide-heart-handshake')).not.toBeNull();
  });

  it('falls back to the default file theme for unmatched names', () => {
    renderWithSurvey({ workspace_name: 'Miscellaneous Topic' });
    expect(document.querySelector('.lucide-file-text')).not.toBeNull();
  });

  it('copies the absolute public link and shows a success toast', async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    renderWithSurvey({ survey_link: 'https://example.com/public/survey' });

    await user.click(screen.getByRole('button', { name: 'More options' }));
    await user.click(await screen.findByRole('menuitem', { name: /Copy Public Link/i }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('https://example.com/public/survey'),
    );
    expect(mockedToast.success).toHaveBeenCalledWith('Public survey link copied to clipboard.');
  });

  it('prefixes relative links with the origin when copying', async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    renderWithSurvey({ survey_link: '/relative/path' });

    await user.click(screen.getByRole('button', { name: 'More options' }));
    await user.click(await screen.findByRole('menuitem', { name: /Copy Public Link/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('http://localhost/relative/path'));
    expect(mockedToast.success).toHaveBeenCalledWith('Public survey link copied to clipboard.');
  });

  it('opens the survey page in a new tab when a link exists', async () => {
    const user = userEvent.setup();
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    renderWithSurvey({ survey_link: '/survey/link' });

    await user.click(screen.getByRole('button', { name: 'More options' }));
    await user.click(await screen.findByRole('menuitem', { name: /Open Survey Page/i }));

    expect(openSpy).toHaveBeenCalledWith(
      'http://localhost/survey/link',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('only shows the copy action when there is no survey link', async () => {
    const user = userEvent.setup();
    renderWithSurvey({ survey_link: null } as never);

    await user.click(screen.getByRole('button', { name: 'More options' }));

    const copyItem = await screen.findByRole('menuitem', { name: /Copy Public Link/i });
    expect(copyItem).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /Open Survey Page/i })).not.toBeInTheDocument();

    await user.click(copyItem);
    expect(mockedToast.info).toHaveBeenCalledWith('No public link generated for this survey yet.');
  });

  it('updates the search query and shows the responses modal', async () => {
    const user = userEvent.setup();
    renderWithSurvey();

    const searchInput = screen.getByPlaceholderText('Search surveys...');
    await user.type(searchInput, 'prod');

    await waitFor(() => expect(mockedHook).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: /View Responses/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
