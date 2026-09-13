import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import PrivacyPolicyPage from '@pages/PrivacyPolicyPage';
import TermsOfUsePage from '@pages/TermsOfUsePage';

describe('PrivacyPolicyPage', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  it('renders title, TOC, exact sections from docx, and does not show metadata pills', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicyPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('AXIORA PULSE PRIVACY POLICY')).toBeInTheDocument();
    // Metadata pills should NOT be present
    expect(screen.queryByText(/Effective Date: \[Insert Date\]/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Last Updated: \[Insert Date\]/i)).not.toBeInTheDocument();

    // Verbatim sections
    expect(screen.getAllByText('1. Introduction').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('26. Governing Framework').length).toBeGreaterThanOrEqual(1);

    // Tab switcher links
    expect(screen.getAllByText('Privacy Policy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Terms & Conditions').length).toBeGreaterThanOrEqual(1);
  });

  it('allows searching within document and clearing search', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicyPage />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText(/Search keywords in this document/i);
    fireEvent.change(searchInput, { target: { value: 'Governing Framework' } });

    expect(screen.getAllByText('26. Governing Framework').length).toBeGreaterThanOrEqual(1);

    const clearBtn = screen.getByLabelText(/Clear search/i);
    fireEvent.click(clearBtn);
    expect(searchInput).toHaveValue('');
  });
});

describe('TermsOfUsePage', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  it('renders title, TOC, exact sections from docx, and does not show metadata pills', () => {
    render(
      <MemoryRouter>
        <TermsOfUsePage />
      </MemoryRouter>,
    );

    expect(screen.getByText('AXIORA PULSE TERMS OF USE & LEGAL TERMS')).toBeInTheDocument();
    // Metadata pills should NOT be present
    expect(screen.queryByText(/Effective Date: \[Insert Date\]/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Last Updated: \[Insert Date\]/i)).not.toBeInTheDocument();

    // Verbatim sections
    expect(screen.getAllByText('1. Acceptance of Terms').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('45. Contact').length).toBeGreaterThanOrEqual(1);

    // Tab switcher links
    expect(screen.getAllByText('Privacy Policy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Terms & Conditions').length).toBeGreaterThanOrEqual(1);
  });
});
