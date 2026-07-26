import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Pagination } from '@components/common/Pagination';

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={jest.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a page link per page when totalPages is small', () => {
    render(<Pagination page={2} totalPages={4} onPageChange={jest.fn()} />);

    [1, 2, 3, 4].forEach((page) => {
      expect(screen.getByRole('link', { name: String(page) })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: String(2) })).toHaveAttribute('aria-current', 'page');
  });

  it('collapses distant pages behind an ellipsis when there are many pages', () => {
    render(<Pagination page={5} totalPages={20} onPageChange={jest.fn()} />);

    expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '20' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '4' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '5' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '6' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '10' })).not.toBeInTheDocument();
    expect(screen.getAllByText('More pages').length).toBeGreaterThan(0);
  });

  it('calls onPageChange with the clicked page number', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('link', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('goes to the previous/next page when those controls are clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('link', { name: /go to previous page/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole('link', { name: /go to next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('does not call onPageChange when previous is clicked on the first page', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);

    const previous = screen.getByRole('link', { name: /go to previous page/i });
    expect(previous).toHaveAttribute('aria-disabled', 'true');

    await user.click(previous);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('does not call onPageChange when next is clicked on the last page', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(<Pagination page={5} totalPages={5} onPageChange={onPageChange} />);

    const next = screen.getByRole('link', { name: /go to next page/i });
    expect(next).toHaveAttribute('aria-disabled', 'true');

    await user.click(next);
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
