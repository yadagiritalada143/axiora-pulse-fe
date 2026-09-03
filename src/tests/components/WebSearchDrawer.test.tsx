import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  WebSearchDrawer,
  type WebSearchStatus,
} from '@features/ideaValidation/components/WebSearchDrawer';
import { useResearchStream } from '@features/ideaValidation/hooks/useResearchStream';

jest.mock('@features/ideaValidation/hooks/useResearchStream', () => ({
  useResearchStream: jest.fn(),
}));

const mockedHook = jest.mocked(useResearchStream);

function mockState(overrides: Record<string, unknown> = {}) {
  mockedHook.mockReturnValue({
    queries: [],
    sources: [],
    activeQuery: null,
    isStreaming: false,
    isComplete: false,
    error: null,
    totalQueries: 0,
    totalSources: 0,
    ...overrides,
  });
}

interface RenderOpts {
  searchStatus?: WebSearchStatus;
  onRetry?: () => void;
}

function renderDrawer(opts: RenderOpts = {}) {
  return render(
    <WebSearchDrawer
      runId="abc-123"
      ideaTitle="My Idea"
      searchStatus={opts.searchStatus}
      onRetry={opts.onRetry}
    />,
  );
}

describe('WebSearchDrawer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null when idle with no sources/queries', () => {
    mockState({});
    renderDrawer({ searchStatus: 'idle' });
    expect(screen.queryByText('Arya is researching…')).not.toBeInTheDocument();
  });

  it('renders searching status', () => {
    mockState({ isStreaming: true });
    renderDrawer({ searchStatus: 'searching' });
    expect(screen.getByText('Arya is researching…')).toBeInTheDocument();
    expect(screen.getByText('Arya is gathering relevant sources…')).toBeInTheDocument();
  });

  it('renders sources_available with a live source', () => {
    mockState({
      totalSources: 1,
      sources: [{ url: 'https://www.example.com/x', title: 'Example Source' }],
    });
    renderDrawer({ searchStatus: 'sources_available' });
    expect(screen.getByText('Arya is researching…')).toBeInTheDocument();
    expect(screen.getByText('Example Source')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('renders complete status with source count', () => {
    mockState({ totalSources: 3 });
    renderDrawer({ searchStatus: 'complete' });
    expect(screen.getByText('Arya researched 3 sources')).toBeInTheDocument();
  });

  it('renders complete status when totalSources is 0', () => {
    mockState({ totalSources: 0 });
    renderDrawer({ searchStatus: 'complete' });
    expect(screen.getByText('Arya finished researching the web')).toBeInTheDocument();
  });

  it('renders search_error with retry button', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    mockState({ error: 'Web search failed. Please try again.' });
    renderDrawer({ searchStatus: 'search_error', onRetry });

    expect(screen.getByText("Arya couldn't complete the research")).toBeInTheDocument();
    expect(screen.getByText('Web search failed. Please try again.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('switches to queries tab and renders queries', async () => {
    const user = userEvent.setup();
    mockState({
      totalQueries: 2,
      queries: [
        { query: 'what is the market', agent: 'Market Agent' },
        { query: 'who are competitors', agent_name: 'Research Agent' },
      ],
    });
    renderDrawer({ searchStatus: 'complete' });

    await user.click(screen.getByText('Queries (2)'));
    expect(screen.getByText('what is the market')).toBeInTheDocument();
    expect(screen.getAllByText('who are competitors').length).toBeGreaterThan(0);
    expect(screen.getByText('Market Agent')).toBeInTheDocument();
    expect(screen.getByText('Research Agent')).toBeInTheDocument();
  });

  it('derives status from stream state when no searchStatus given', () => {
    mockState({ isStreaming: true });
    renderDrawer();
    expect(screen.getByText('Arya is researching…')).toBeInTheDocument();
  });
});
