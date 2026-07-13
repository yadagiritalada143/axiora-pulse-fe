import { useRouteError } from 'react-router-dom';

import { GlobalErrorFallback } from '@components/common/ErrorBoundary';

/** Route-level errorElement layout - catches loader/render errors React Router surfaces. */
export function ErrorLayout() {
  const routeError = useRouteError();
  const error =
    routeError instanceof Error ? routeError : new Error('An unexpected error occurred.');

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <GlobalErrorFallback error={error} reset={() => window.location.assign('/')} />
    </div>
  );
}
