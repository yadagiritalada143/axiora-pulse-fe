import { render, screen } from '@testing-library/react';

import type { ChatMessage } from '@/types/chat.types';
import { AIMessage } from '@components/chat/AIMessage';

// `react-markdown`/`remark-gfm` are ESM-only and aren't transformable under the shared Jest
// config (out of scope here) - stub them with a plain passthrough since AIMessage's own tests
// only care about which branch (typing indicator vs. markdown) is rendered, not markdown parsing.
jest.mock('remark-gfm', () => () => null);
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <p>{children}</p>;
  };
});

const baseMessage: ChatMessage = {
  id: 'msg-1',
  conversationId: 'conv-1',
  role: 'assistant',
  content: 'Here is my advice.',
  attachments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('AIMessage', () => {
  it('renders the message content via the markdown renderer', () => {
    render(<AIMessage message={baseMessage} />);

    expect(screen.getByText('Here is my advice.')).toBeInTheDocument();
  });

  it('renders the "AI" avatar label', () => {
    render(<AIMessage message={baseMessage} />);

    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('renders a typing indicator instead of markdown while streaming with no content yet', () => {
    render(<AIMessage message={{ ...baseMessage, content: '', isStreaming: true }} />);

    expect(screen.getByRole('status', { name: 'Assistant is typing' })).toBeInTheDocument();
  });

  it('renders streamed-in content once available, even while still streaming', () => {
    render(
      <AIMessage message={{ ...baseMessage, content: 'Partial answer', isStreaming: true }} />,
    );

    expect(screen.getByText('Partial answer')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Assistant is typing' })).not.toBeInTheDocument();
  });
});
