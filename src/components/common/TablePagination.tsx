import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';

interface TablePaginationProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
  isLoading?: boolean;
  itemLabel?: string;
  className?: string;
}

export function TablePagination({
  total,
  limit,
  offset,
  onPageChange,
  isLoading = false,
  itemLabel = 'records',
  className,
}: TablePaginationProps) {
  if (total === 0) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const startRecord = offset + 1;
  const endRecord = Math.min(offset + limit, total);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePageClick = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages || isLoading) return;
    onPageChange((page - 1) * limit);
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={cn(
        'border-border flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row',
        className,
      )}
    >
      <p className="text-muted-foreground text-xs font-medium">
        Showing <span className="text-foreground font-semibold">{startRecord}</span> to{' '}
        <span className="text-foreground font-semibold">{endRecord}</span> of{' '}
        <span className="text-foreground font-semibold">{total}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={!hasPrevious || isLoading}
          className="border-border text-foreground hover:bg-muted size-8 cursor-pointer rounded-lg"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {getPageNumbers().map((item, idx) => {
          if (item === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="text-muted-foreground px-2 text-xs select-none"
              >
                ...
              </span>
            );
          }

          const isActive = item === currentPage;
          return (
            <Button
              key={item}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageClick(item)}
              disabled={isLoading}
              className={cn(
                'size-8 cursor-pointer rounded-lg p-0 text-xs font-semibold transition-colors',
                isActive
                  ? 'border-transparent bg-[#FF4500] text-white shadow-xs hover:bg-[#FF4500]/90'
                  : 'border-border text-foreground hover:bg-muted bg-background',
              )}
            >
              {item}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={!hasNext || isLoading}
          className="border-border text-foreground hover:bg-muted size-8 cursor-pointer rounded-lg"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
