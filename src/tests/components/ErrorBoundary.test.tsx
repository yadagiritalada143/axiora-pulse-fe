import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ErrorBoundary, GlobalErrorFallback } from '@components/common/ErrorBoundary';

// ErrorBoundary logs via `@utils/logger`, which reads `import.meta.env` through `@config/env` -
// stub it out so the module can load under Babel/Jest.
jest.mock('@config/env', () => ({
  env: { enableLogger: false },
}));

function ThrowingChild(): never {
  throw new Error('Kaboom');
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>All good</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders the default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Kaboom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('renders a custom fallback when provided, receiving the error and a reset function', async () => {
    const user = userEvent.setup();

    function Boom() {
      return (
        <ErrorBoundary
          fallback={(error, reset) => (
            <div>
              <span>Custom: {error.message}</span>
              <button type="button" onClick={reset}>
                Reset
              </button>
            </div>
          )}
        >
          <ThrowingChild />
        </ErrorBoundary>
      );
    }

    render(<Boom />);

    expect(screen.getByText('Custom: Kaboom')).toBeInTheDocument();

    // Clicking reset re-renders children, which throw again, so the fallback stays shown.
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByText('Custom: Kaboom')).toBeInTheDocument();
  });
});

describe('GlobalErrorFallback', () => {
  it('renders the error message and calls reset when the button is clicked', async () => {
    const user = userEvent.setup();
    const reset = jest.fn();

    render(<GlobalErrorFallback error={new Error('Standalone failure')} reset={reset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Standalone failure')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
