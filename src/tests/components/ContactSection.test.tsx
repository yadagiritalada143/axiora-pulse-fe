import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { ContactSection } from '@features/landing/components/ContactSection';
import { useSubmitContact } from '@features/landing/hooks/useSubmitContact';

jest.mock('@features/landing/hooks/useSubmitContact', () => ({
  useSubmitContact: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedUseSubmitContact = jest.mocked(useSubmitContact);

function setupMutation(overrides: Partial<ReturnType<typeof useSubmitContact>> = {}) {
  return {
    mutate: jest.fn(),
    isPending: false,
    ...overrides,
  } as ReturnType<typeof useSubmitContact>;
}

describe('ContactSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact details and form fields', () => {
    mockedUseSubmitContact.mockReturnValue(setupMutation());
    render(<ContactSection />);

    expect(screen.getByText('GET IN TOUCH')).toBeInTheDocument();
    expect(screen.getByText('Email Us')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Message/ })).toBeInTheDocument();
  });

  it('shows error toast when required fields are missing', () => {
    mockedUseSubmitContact.mockReturnValue(setupMutation());
    const { container } = render(<ContactSection />);

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    if (form) {
      fireEvent.submit(form);
    }

    expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields.');
  });

  it('submits contact with trimmed data and resets form on success', async () => {
    const mutate = jest.fn().mockImplementation((_payload, { onSuccess }) => {
      onSuccess();
    });
    mockedUseSubmitContact.mockReturnValue(setupMutation({ mutate }));
    const user = userEvent.setup();
    render(<ContactSection />);

    await user.type(screen.getByLabelText(/Your Name/), '  Alex  ');
    await user.type(screen.getByLabelText(/Email Address/), 'alex@company.com');
    await user.type(screen.getByLabelText(/Message/), '  Hi there  ');
    await user.click(screen.getByRole('button', { name: /Send Message/ }));

    expect(mutate).toHaveBeenCalledWith(
      { name: 'Alex', email: 'alex@company.com', topic: 'General Inquiry', message: 'Hi there' },
      expect.any(Object),
    );

    expect(screen.getByLabelText<HTMLInputElement>(/Your Name/).value).toBe('');
  });

  it('renders a sending message state when pending', () => {
    mockedUseSubmitContact.mockReturnValue(setupMutation({ isPending: true }));
    render(<ContactSection />);

    expect(screen.getByText(/Sending message/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sending message/ })).toBeDisabled();
  });

  it('handles the learn-more-style subject change', () => {
    mockedUseSubmitContact.mockReturnValue(setupMutation());
    render(<ContactSection />);

    const select = screen.getByLabelText(/Subject/);
    fireEvent.change(select, { target: { value: 'Product Feedback' } });
    expect((select as HTMLSelectElement).value).toBe('Product Feedback');
  });
});
