import { fireEvent, render, screen } from '@testing-library/react';

import { Pagination } from '@components/common/Pagination';

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders page links and reports clicks', () => {
    const onPageChange = jest.fn();
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />);

    const pageOne = screen.getByRole('link', { name: '1' });
    fireEvent.click(pageOne);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('renders ellipses for large page counts', () => {
    render(<Pagination page={5} totalPages={10} onPageChange={jest.fn()} />);

    expect(screen.getAllByText('More pages').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: '5' })).toBeInTheDocument();
  });
});
