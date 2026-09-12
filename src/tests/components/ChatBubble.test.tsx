import { render, screen } from '@testing-library/react';

import { ChatBubble } from '@components/chat/ChatBubble';

describe('ChatBubble', () => {
  it('renders children, avatar label, and timestamp', () => {
    render(
      <ChatBubble align="left" avatarLabel="AI" timestamp="2 minutes ago">
        <p>Hello there</p>
      </ChatBubble>,
    );

    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('2 minutes ago')).toBeInTheDocument();
  });

  it('does not render a timestamp element when none is provided', () => {
    render(
      <ChatBubble align="left" avatarLabel="AI">
        <p>No timestamp</p>
      </ChatBubble>,
    );

    expect(screen.queryByText(/ago/)).not.toBeInTheDocument();
  });

  it('right-aligns the bubble and reverses row order when align is "right"', () => {
    const { container } = render(
      <ChatBubble align="right" avatarLabel="U" timestamp="now">
        <p>My message</p>
      </ChatBubble>,
    );

    const outer = container.firstChild as HTMLElement;
    expect(outer).toHaveClass('flex-row-reverse');
  });

  it('does not reverse row order when align is "left"', () => {
    const { container } = render(
      <ChatBubble align="left" avatarLabel="U">
        <p>My message</p>
      </ChatBubble>,
    );

    const outer = container.firstChild as HTMLElement;
    expect(outer).not.toHaveClass('flex-row-reverse');
  });

  it('applies custom className to the outer wrapper and bubbleClassName to the inner bubble', () => {
    const { container } = render(
      <ChatBubble
        align="left"
        avatarLabel="AI"
        className="custom-outer-class"
        bubbleClassName="w-fit self-start"
      >
        <p>Content</p>
      </ChatBubble>,
    );

    const outer = container.firstChild as HTMLElement;
    expect(outer).toHaveClass('custom-outer-class');

    const bubble = screen.getByText('Content').parentElement;
    expect(bubble).toHaveClass('w-fit', 'self-start');
    expect(bubble).not.toHaveClass('w-full');
  });
});
