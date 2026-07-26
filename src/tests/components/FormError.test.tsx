import { render, screen } from '@testing-library/react';

import { FormError } from '@components/common/FormError';

describe('FormError', () => {
  it('renders nothing when message is not provided', () => {
    const { container } = render(<FormError />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when message is null', () => {
    const { container } = render(<FormError message={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message when provided', () => {
    render(<FormError message="Invalid credentials" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });
});
