import { render, screen } from '@testing-library/react';

import AIChatPage from '@pages/AIChatPage';

jest.mock('@features/ai/components/ChatWindow', () => ({
  ChatWindow: () => <div>Chat window content</div>,
}));

describe('AIChatPage', () => {
  it('renders the page header and composes the ChatWindow feature component', () => {
    render(<AIChatPage />);

    expect(screen.getByRole('heading', { name: 'AI Mentor' })).toBeInTheDocument();
    expect(
      screen.getByText('Chat with your AI Mentor to validate and shape your idea.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Chat window content')).toBeInTheDocument();
  });
});
