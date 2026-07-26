import { render, screen } from '@testing-library/react';

import { ApiErrorMessage } from '@components/common/ApiErrorMessage';

describe('ApiErrorMessage', () => {
  it('renders nothing when there is no error', () => {
    const { container } = render(<ApiErrorMessage error={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the normalized message for an ApiError-shaped error', () => {
    render(
      <ApiErrorMessage error={{ status: 400, code: 'BAD_REQUEST', message: 'Invalid input' }} />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid input');
  });

  it('renders a fallback message for an unrecognized error shape', () => {
    render(<ApiErrorMessage error={new Error('boom')} />);

    expect(screen.getByRole('alert')).toHaveTextContent('An unexpected error occurred.');
  });

  it('applies the provided className', () => {
    render(
      <ApiErrorMessage
        error={{ status: 500, code: 'SERVER_ERROR', message: 'Server error' }}
        className="custom-class"
      />,
    );

    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });
});
