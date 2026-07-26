import { render, screen } from '@testing-library/react';

import { TypingIndicator } from '@components/chat/TypingIndicator';

describe('TypingIndicator', () => {
  it('renders an accessible status region announcing that the assistant is typing', () => {
    render(<TypingIndicator />);

    const status = screen.getByRole('status', { name: 'Assistant is typing' });
    expect(status).toBeInTheDocument();
    expect(status.querySelectorAll('span')).toHaveLength(3);
  });
});
