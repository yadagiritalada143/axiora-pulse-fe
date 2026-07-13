import { Suspense, lazy, type ComponentType } from 'react';

import { PageLoader } from '@components/common/Loader';

/** Wraps a `React.lazy` page import with the shared page-level Suspense fallback. */
export function lazyPage(importer: () => Promise<{ default: ComponentType }>) {
  const LazyComponent = lazy(importer);

  return (
    <Suspense fallback={<PageLoader />}>
      <LazyComponent />
    </Suspense>
  );
}
