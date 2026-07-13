import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@components/ui/button';
import { logger } from '@utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Catches render-time errors in the subtree below it and shows a recoverable fallback. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('ErrorBoundary caught an error', error, errorInfo.componentStack);
  }

  reset = (): void => this.setState({ error: null });

  override render(): ReactNode {
    const { error } = this.state;

    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset);
      return <GlobalErrorFallback error={error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

export function GlobalErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-foreground text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md text-sm">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
