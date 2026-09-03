import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResearchStreamPanel } from '@features/ideaValidation/components/ResearchStreamPanel';
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
    isStreaming: true,
    isComplete: false,
    error: null,
    totalQueries: 0,
    totalSources: 0,
    ...overrides,
  });
}

describe('ResearchStreamPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null when no queries and not streaming', () => {
    mockState({ queries: [], isStreaming: false });
    const { container } = render(<ResearchStreamPanel runId="abc" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders streaming header and sources', () => {
    mockState({
      isStreaming: true,
      totalQueries: 1,
      totalSources: 2,
      sources: [
        { url: 'https://example.com/a', title: 'Source A', snippet: 'snip', agent_name: 'Market' },
        { url: 'https://www.foo.org/b', title: 'Source B' },
      ],
    });
    render(<ResearchStreamPanel runId="abc" />);
    expect(screen.getByText('Live Web Research & Source Discovery')).toBeInTheDocument();
    expect(screen.getByText('Live Stream')).toBeInTheDocument();
    expect(screen.getByText('Source A')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('foo.org')).toBeInTheDocument();
    expect(screen.getByText('snip')).toBeInTheDocument();
  });

  it('renders completed state', () => {
    mockState({
      isStreaming: false,
      isComplete: true,
      totalQueries: 3,
      totalSources: 1,
      queries: [{ query: 'q1', agent: 'Agent' }],
    });
    render(<ResearchStreamPanel runId="abc" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('3 queries executed • 1 web sources captured')).toBeInTheDocument();
  });

  it('shows active query in streaming bar', () => {
    mockState({
      isStreaming: true,
      activeQuery: 'What is the total addressable market for AI tools?',
      queries: [{ query: 'active' }],
    });
    render(<ResearchStreamPanel runId="abc" />);
    expect(screen.getByText('Active Web Search')).toBeInTheDocument();
  });

  it('switches to queries tab and renders query rows', async () => {
    const user = userEvent.setup();
    mockState({
      isStreaming: false,
      isComplete: true,
      totalQueries: 2,
      queries: [{ query: 'query one', agent: 'Market Agent' }, { query: 'query two' }],
    });
    render(<ResearchStreamPanel runId="abc" />);

    await user.click(screen.getByText('Search Queries (2)'));
    expect(screen.getByText('query one')).toBeInTheDocument();
    expect(screen.getByText('query two')).toBeInTheDocument();
    expect(screen.getByText('Market Agent')).toBeInTheDocument();
  });

  it('collapses and expands content on header click', async () => {
    const user = userEvent.setup();
    mockState({
      isStreaming: true,
      sources: [{ url: 'https://example.com', title: 'Src' }],
    });
    const { rerender } = render(<ResearchStreamPanel runId="abc" />);
    expect(screen.getByText('Src')).toBeInTheDocument();

    await user.click(screen.getByText('Live Web Research & Source Discovery'));
    expect(screen.queryByText('Src')).not.toBeInTheDocument();
    void rerender;
  });

  it('renders empty sources message when complete with no sources', () => {
    mockState({ isStreaming: false, isComplete: true, queries: [{ query: 'q' }] });
    render(<ResearchStreamPanel runId="abc" />);
    expect(screen.getByText('No sources recorded for this run.')).toBeInTheDocument();
  });
});
