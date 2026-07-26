import { render, screen } from '@testing-library/react';

import VerifyOtpPage from '@pages/VerifyOtpPage';

jest.mock('@/features/auth/components/VerifyOtpForm', () => ({
  VerifyOtpForm: ({ heading, description }: { heading: string; description: string }) => (
    <div>
      VerifyOtpForm stub: {heading} / {description}
    </div>
  ),
}));

describe('VerifyOtpPage', () => {
  it('renders the verify OTP form with the expected heading and description', () => {
    render(<VerifyOtpPage />);

    expect(
      screen.getByText(
        'VerifyOtpForm stub: Enter the code / Fill the necessary things to sign in to your account',
      ),
    ).toBeInTheDocument();
  });
});
