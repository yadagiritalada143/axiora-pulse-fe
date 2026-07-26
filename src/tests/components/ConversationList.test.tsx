import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Conversation } from '@/types/chat.types';
import { ConversationList } from '@components/chat/ConversationList';

const conversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Idea validation',
    modelId: 'model-1',
    lastMessagePreview: 'Let us refine your pitch',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'conv-2',
    title: 'Pricing strategy',
    modelId: 'model-1',
    lastMessagePreview: null,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('ConversationList', () => {
  it('renders every conversation title and available preview', () => {
    render(
      <ConversationList
        conversations={conversations}
        activeConversationId={null}
        onSelect={jest.fn()}
        onCreate={jest.fn()}
      />,
    );

    expect(screen.getByText('Idea validation')).toBeInTheDocument();
    expect(screen.getByText('Let us refine your pitch')).toBeInTheDocument();
    expect(screen.getByText('Pricing strategy')).toBeInTheDocument();
  });

  it('highlights the active conversation', () => {
    render(
      <ConversationList
        conversations={conversations}
        activeConversationId="conv-2"
        onSelect={jest.fn()}
        onCreate={jest.fn()}
      />,
    );

    expect(screen.getByText('Pricing strategy').closest('button')).toHaveClass('bg-accent');
    expect(screen.getByText('Idea validation').closest('button')).not.toHaveClass('bg-accent');
  });

  it('calls onSelect with the clicked conversation id', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <ConversationList
        conversations={conversations}
        activeConversationId={null}
        onSelect={onSelect}
        onCreate={jest.fn()}
      />,
    );

    await user.click(screen.getByText('Idea validation'));
    expect(onSelect).toHaveBeenCalledWith('conv-1');
  });

  it('calls onCreate when the new-conversation button is clicked', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();

    render(
      <ConversationList
        conversations={conversations}
        activeConversationId={null}
        onSelect={jest.fn()}
        onCreate={onCreate}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'New conversation' }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
