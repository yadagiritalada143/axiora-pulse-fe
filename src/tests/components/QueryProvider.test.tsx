import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { QueryProvider } from '@app/providers/QueryProvider';
import { queryClient } from '@app/query/queryClient';

jest.mock('@config/env', () => ({
  env: { appName: 'Axiora Pulse', apiUrl: '', aiStreaming: false, isDev: false, isProd: true },
}));

function ClientProbe() {
  const client = useQueryClient();
  return <div>Client resolved: {client === queryClient ? 'yes' : 'no'}</div>;
}

describe('QueryProvider', () => {
  it('provides the shared queryClient to descendants without throwing', () => {
    render(
      <QueryProvider>
        <ClientProbe />
      </QueryProvider>,
    );

    expect(screen.getByText('Client resolved: yes')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <QueryProvider>
        <div>Provider child</div>
      </QueryProvider>,
    );

    expect(screen.getByText('Provider child')).toBeInTheDocument();
  });
});
