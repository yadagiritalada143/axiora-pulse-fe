import { render, screen } from '@testing-library/react';

import AdminPlansPage from '@pages/AdminPlansPage';

jest.mock('@features/admin/components', () => ({
  AdminPlansList: () => <div data-testid="admin-plans-list" />,
}));

describe('AdminPlansPage', () => {
  it('renders the admin plans list component', () => {
    render(<AdminPlansPage />);

    expect(screen.getByTestId('admin-plans-list')).toBeInTheDocument();
  });
});
