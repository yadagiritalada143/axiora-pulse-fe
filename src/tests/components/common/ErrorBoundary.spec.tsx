import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { ErrorBoundary } from '@components/common/ErrorBoundary';

jest.mock('@utils/logger', () => ({
  logger: { error: jest.fn() },
}));

function Boom(): ReactNode {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeAll(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterAll(() => {
    consoleError.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>safe-child</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('safe-child')).toBeInTheDocument();
  });

  it('renders the default fallback and can reset', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('kaboom')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={(error) => <div>custom: {error.message}</div>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('custom: kaboom')).toBeInTheDocument();
  });
});
