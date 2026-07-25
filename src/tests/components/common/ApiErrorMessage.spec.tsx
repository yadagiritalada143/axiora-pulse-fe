import { render, screen } from '@testing-library/react';

import { ApiRequestError } from '@/types/error.types';
import { ApiErrorMessage } from '@components/common/ApiErrorMessage';

describe('ApiErrorMessage', () => {
  it('renders nothing when there is no error', () => {
    const { container } = render(<ApiErrorMessage error={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message for a normalized API error', () => {
    const error = new ApiRequestError({ status: 400, code: 'X', message: 'Invalid field' });
    render(<ApiErrorMessage error={error} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid field');
  });

  it('renders a fallback message for an unknown error', () => {
    render(<ApiErrorMessage error={new Error('raw')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('An unexpected error occurred.');
  });
});
