import { render, screen, waitFor } from '@testing-library/react';

import { lazyPage } from '@app/router/lazyPage';

describe('lazyPage', () => {
  it('renders the lazily-imported page after loading', async () => {
    const element = lazyPage(() => Promise.resolve({ default: () => <div>lazy-page</div> }));

    render(element);

    await waitFor(() => expect(screen.getByText('lazy-page')).toBeInTheDocument());
  });
});
