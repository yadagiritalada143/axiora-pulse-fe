import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { contactService } from '@features/landing/api/contact.service';
import { ContactSection } from '@features/landing/components/ContactSection';

jest.mock('@features/landing/api/contact.service', () => ({
  contactService: {
    submitContact: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedSubmitContact = jest.mocked(contactService.submitContact);

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ContactSection />
    </QueryClientProvider>,
  );
}

describe('ContactSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all inputs and labels correctly', () => {
    renderComponent();

    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject \/ Topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
  });

  it('submits contact details to the API and shows a success toast on success', async () => {
    const user = userEvent.setup();
    mockedSubmitContact.mockResolvedValueOnce({
      success: true,
      message: 'Thank you for reaching out. We will get back to you shortly.',
    });

    renderComponent();

    await user.type(screen.getByLabelText(/Your Name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/Email Address/i), 'jane@example.com');
    await user.selectOptions(screen.getByLabelText(/Subject \/ Topic/i), 'Technical Support');
    await user.type(screen.getByLabelText(/Message/i), 'Need assistance with workspace agents.');

    await user.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(mockedSubmitContact).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        topic: 'Support',
        message: 'Need assistance with workspace agents.',
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Thank you for reaching out. We will get back to you shortly.',
      );
    });
  });

  it('shows an error toast on API failure', async () => {
    const user = userEvent.setup();
    mockedSubmitContact.mockRejectedValueOnce({
      response: { data: { message: 'Rate limit exceeded' } },
    });

    renderComponent();

    await user.type(screen.getByLabelText(/Your Name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/Email Address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/Message/i), 'Test query');

    await user.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Rate limit exceeded');
    });
  });
});
