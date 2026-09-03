import { render, screen } from '@testing-library/react';

import { LiveAgentSearchIndicator } from '@features/ideaValidation/components/LiveAgentSearchIndicator';
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

describe('LiveAgentSearchIndicator', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders connecting state with no data', () => {
    mockState();
    render(<LiveAgentSearchIndicator runId="abc" />);
    expect(screen.getByText('Live Web Search Active')).toBeInTheDocument();
    expect(screen.getByText('Connecting to live web research stream…')).toBeInTheDocument();
  });

  it('renders sourcing state with latest source hostname', () => {
    mockState({
      totalQueries: 2,
      totalSources: 1,
      sources: [
        { url: 'https://www.example.com/page', title: 'Example Page', agent_name: 'Market Agent' },
      ],
    });
    render(<LiveAgentSearchIndicator runId="abc" />);
    expect(screen.getByText('2 queries • 1 sources')).toBeInTheDocument();
    expect(screen.getByText('Market Agent')).toBeInTheDocument();
    expect(screen.getByText('Example Page')).toBeInTheDocument();
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
    expect(screen.getByText('Inspecting Source:')).toBeInTheDocument();
  });

  it('renders query state when no source present', () => {
    mockState({
      sources: [],
      queries: [{ query: 'market size', agent: 'Research Agent' }],
      activeQuery: 'market size',
      totalQueries: 1,
    });
    render(<LiveAgentSearchIndicator runId="abc" />);
    expect(screen.getByText('Research Agent')).toBeInTheDocument();
    expect(screen.getByText('Searching Query:')).toBeInTheDocument();
  });

  it('falls back to default agent name', () => {
    mockState({
      sources: [],
      queries: [{ query: 'q' }],
    });
    render(<LiveAgentSearchIndicator runId="abc" />);
    expect(screen.getByText('Market Research Agent')).toBeInTheDocument();
  });

  it('falls back to web-source when source url is invalid', () => {
    mockState({
      sources: [{ url: 'not-a-url', title: 'T' }],
    });
    render(<LiveAgentSearchIndicator runId="abc" />);
    expect(screen.getByText('(web-source)')).toBeInTheDocument();
  });
});
