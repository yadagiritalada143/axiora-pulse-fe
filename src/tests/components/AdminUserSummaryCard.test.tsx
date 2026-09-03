import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { AdminUserSummaryCard } from '@features/admin/components/AdminUserSummaryCard';
import type { AdminUserSurveySummaryResponse } from '@features/admin/types';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const baseSummary: AdminUserSurveySummaryResponse = {
  user_id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  status: 'Active',
  joined_on: '2025-01-15T00:00:00Z',
  surveys_created: 4,
  total_responses: 12,
};

function renderCard(summary: AdminUserSurveySummaryResponse = baseSummary) {
  return render(<AdminUserSummaryCard summary={summary} />);
}

describe('AdminUserSummaryCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders user name, email, and stats', () => {
    renderCard();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2025')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('shows fallback initials when name and email are missing', () => {
    renderCard({
      user_id: 2,
      name: '',
      email: '',
      status: 'Inactive',
      joined_on: '',
      surveys_created: 0,
      total_responses: 0,
    });
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('uses first email letter as initial when name missing', () => {
    renderCard({
      user_id: 3,
      name: '',
      email: 'alice@example.com',
      status: 'Inactive',
      joined_on: '',
      surveys_created: 0,
      total_responses: 0,
    });
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('changes status via dropdown and shows success toast', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByLabelText('User Options'));
    await user.click(screen.getByText('Set as Inactive'));
    expect(toast.success).toHaveBeenCalledWith('User status updated to Inactive.');
  });
});
