import { Search as SearchIcon } from 'lucide-react';
import { type ChangeEvent, useEffect, useState } from 'react';

import { Input } from '@components/ui/input';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { cn } from '@lib/utils';

interface SearchProps {
  placeholder?: string;
  className?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

export function Search({
  placeholder = 'Search anything...',
  className,
  onSearch,
  debounceMs = 300,
}: SearchProps) {
  const [value, setValue] = useState('');
  const debouncedValue = useDebouncedValue(value, debounceMs);

  useEffect(() => {
    onSearch(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value);

  return (
    <div className={cn('relative', className)}>
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9"
        aria-label="Search"
      />
    </div>
  );
}
