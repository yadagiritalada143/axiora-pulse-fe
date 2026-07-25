import { render, screen } from '@testing-library/react';

import { ButtonLoader, Loader, PageLoader } from '@components/common/Loader';

describe('Loader', () => {
  it('renders a default accessible loading label', () => {
    render(<Loader />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders a custom label', () => {
    render(<Loader label="Please wait" />);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('PageLoader renders a page-level label', () => {
    render(<PageLoader />);
    expect(screen.getByText('Loading page')).toBeInTheDocument();
  });

  it('ButtonLoader renders a spinner', () => {
    const { container } = render(<ButtonLoader />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
