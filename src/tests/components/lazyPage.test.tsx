import { render, screen } from '@testing-library/react';

import { lazyPage } from '@app/router/lazyPage';

describe('lazyPage', () => {
  it('shows the fallback loader then renders the lazily-imported component', async () => {
    const element = lazyPage(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ default: () => <div>Loaded</div> }), 0);
        }),
    );

    render(element);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByText('Loaded')).toBeInTheDocument();
  });

  it('renders the component immediately-resolved import eventually', async () => {
    const element = lazyPage(() => Promise.resolve({ default: () => <div>Ready</div> }));

    render(element);

    expect(await screen.findByText('Ready')).toBeInTheDocument();
  });
});
