import { render, screen, waitFor } from '@testing-library/react';

import { lazyPage } from '@app/router/lazyPage';

describe('lazyPage', () => {
  it('renders the lazily-imported page after loading', async () => {
    function LazyPage() {
      return <div>lazy-page</div>;
    }
    const element = lazyPage(() => Promise.resolve({ default: LazyPage }));

    render(element);

    await waitFor(() => expect(screen.getByText('lazy-page')).toBeInTheDocument());
  });
});
