import { useCallback, useState } from 'react';

import { storage } from '@utils/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => storage.get<T>(key) ?? initialValue);

  const set = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved = next instanceof Function ? next(previous) : next;
        storage.set(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, set] as const;
}
