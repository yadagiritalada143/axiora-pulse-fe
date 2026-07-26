import { render, screen } from '@testing-library/react';

import type { ChatMessage } from '@/types/chat.types';
import { UserMessage } from '@components/chat/UserMessage';

const baseMessage: ChatMessage = {
  id: 'msg-1',
  conversationId: 'conv-1',
  role: 'user',
  content: 'What is a good MVP scope?',
  attachments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('UserMessage', () => {
  it('renders the message content', () => {
    render(<UserMessage message={baseMessage} />);

    expect(screen.getByText('What is a good MVP scope?')).toBeInTheDocument();
  });

  it('renders the "U" avatar label', () => {
    render(<UserMessage message={baseMessage} />);

    expect(screen.getByText('U')).toBeInTheDocument();
  });
});
