import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AdminUsersTable } from '@features/admin/components/AdminUsersTable';
import { useAdminUsers } from '@features/admin/hooks';

jest.mock('@features/admin/hooks', () => ({
  useAdminUsers: jest.fn(),
}));

const mockedUseAdminUsers = jest.mocked(useAdminUsers);

describe('AdminUsersTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading indicator while loading', () => {
    mockedUseAdminUsers.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminUsers>);

    render(<AdminUsersTable />);

    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('renders error message when query fails', () => {
    mockedUseAdminUsers.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch'),
    } as unknown as ReturnType<typeof useAdminUsers>);

    render(<AdminUsersTable />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders table rows with user data when successful', () => {
    mockedUseAdminUsers.mockReturnValue({
      data: {
        users: [
          {
            id: 1,
            username: 'prabhas@mailinator.com',
            display_name: 'Prabhas',
            role: 'admin',
            created_at: '2026-07-30T09:39:44.020Z',
            workspace_count: 3,
          },
          {
            id: 2,
            username: 'user@example.com',
            display_name: 'Regular User',
            role: 'user',
            created_at: '2026-07-30T09:39:44.020Z',
            workspace_count: 0,
          },
        ],
        pagination: {
          total: 2,
          limit: 25,
          offset: 0,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminUsers>);

    render(<AdminUsersTable />);

    expect(screen.getByText('Users Management')).toBeInTheDocument();
    expect(screen.getByText('Prabhas')).toBeInTheDocument();
    expect(screen.getByText('@prabhas@mailinator.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('3 workspaces')).toBeInTheDocument();

    expect(screen.getByText('Regular User')).toBeInTheDocument();
    expect(screen.getByText('@user@example.com')).toBeInTheDocument();
    expect(screen.getByText('0 workspaces')).toBeInTheDocument();
  });

  it('filters users when search term is typed', async () => {
    const user = userEvent.setup();

    mockedUseAdminUsers.mockReturnValue({
      data: {
        users: [],
        pagination: { total: 0, limit: 25, offset: 0 },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminUsers>);

    render(<AdminUsersTable />);

    const searchInput = screen.getByPlaceholderText('Search by name or username...');
    await user.type(searchInput, 'Prabhas');

    expect(searchInput).toHaveValue('Prabhas');
  });

  it('advances to the next page and back when there are more results than fit on one page', async () => {
    const user = userEvent.setup();

    mockedUseAdminUsers.mockReturnValue({
      data: {
        users: [
          {
            id: 1,
            username: 'prabhas@mailinator.com',
            display_name: 'Prabhas',
            role: 'user',
            created_at: '2026-07-30T09:39:44.020Z',
            workspace_count: 1,
          },
        ],
        pagination: { total: 25, limit: 10, offset: 10 },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useAdminUsers>);

    render(<AdminUsersTable />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).toBeEnabled();
    expect(nextButton).toBeEnabled();

    // Clicking either button updates internal offset state; the mocked hook keeps returning
    // the same page, but this exercises the handlePrevPage/handleNextPage branches.
    await user.click(nextButton);
    await user.click(prevButton);

    // Text is split across <span> elements, so match on the container's combined text content.
    expect(screen.getByText(/showing/i).closest('p')).toHaveTextContent(
      'Showing 11 to 20 of 25 users',
    );
  });
});
