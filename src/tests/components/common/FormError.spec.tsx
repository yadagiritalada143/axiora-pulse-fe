import { render, screen } from '@testing-library/react';

import { FormError } from '@components/common/FormError';

describe('FormError', () => {
  it('renders nothing when there is no message', () => {
    const { container } = render(<FormError message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an alert with the message', () => {
    render(<FormError message="Something failed" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something failed');
  });
});
