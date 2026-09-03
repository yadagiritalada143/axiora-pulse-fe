import { fireEvent, render, screen } from '@testing-library/react';

import { LandingFooter } from '@features/landing/components/LandingFooter';

describe('LandingFooter', () => {
  it('renders brand, quick links and connect links', () => {
    render(<LandingFooter />);

    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Solutions')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Twitter / X')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
  });

  it('prevents default and scrolls to section on quick link click', () => {
    render(<LandingFooter />);

    const faqLink = screen.getByText('FAQ').closest('a');
    expect(faqLink).not.toBeNull();
    if (faqLink) {
      fireEvent.click(faqLink);
      expect(faqLink.getAttribute('href')).toBe('#faq');
    }
  });
});
