import { render, screen } from '@testing-library/react';

import { ButtonLoader, Loader, PageLoader } from '@components/common/Loader';

describe('Loader', () => {
  it('renders a visually hidden default label when none is provided', () => {
    render(<Loader />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(screen.getByText('Loading')).toHaveClass('sr-only');
  });

  it('renders a visible custom label when provided', () => {
    render(<Loader label="Fetching data" />);

    const label = screen.getByText('Fetching data');
    expect(label).not.toHaveClass('sr-only');
  });

  it('applies the provided className', () => {
    render(<Loader className="custom-loader" />);

    expect(screen.getByRole('status')).toHaveClass('custom-loader');
  });
});

describe('PageLoader', () => {
  it('renders the "Loading page" label', () => {
    render(<PageLoader />);

    expect(screen.getByText('Loading page')).toBeInTheDocument();
  });
});

describe('ButtonLoader', () => {
  it('renders a spinner with an accessible-hidden svg', () => {
    const { container } = render(<ButtonLoader className="extra-class" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveClass('extra-class');
  });
});
