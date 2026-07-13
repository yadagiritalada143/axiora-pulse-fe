import { render, screen } from '@testing-library/react';

import { PageHeader } from '@components/common/PageHeader';

describe('PageHeader', () => {
  it('renders the title and description', () => {
    render(<PageHeader title="Workspace" description="Manage your workspaces" />);

    expect(screen.getByRole('heading', { name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByText('Manage your workspaces')).toBeInTheDocument();
  });

  it('renders action content when provided', () => {
    render(<PageHeader title="Workspace" actions={<button type="button">New</button>} />);

    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });
});
