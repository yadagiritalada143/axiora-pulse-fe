import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { useCurrentUser } from '@features/auth/hooks';
import { CertificateNameConfirmDialog } from '@features/ideaValidation/components/CertificateNameConfirmDialog';
import { useUserDetails } from '@features/settings/hooks/useUserDetails';
import { useDownloadCertificate } from '@features/workspace/hooks/useWorkspaceMentor';
import { downloadFile } from '@utils/file';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@utils/file', () => ({
  downloadFile: jest.fn(),
}));

jest.mock('@features/auth/hooks', () => ({
  useCurrentUser: jest.fn(),
}));

jest.mock('@features/settings/hooks/useUserDetails', () => ({
  useUserDetails: jest.fn(),
}));

jest.mock('@features/workspace/hooks/useWorkspaceMentor', () => ({
  useDownloadCertificate: jest.fn(),
}));

const mockedUseCurrentUser = useCurrentUser as jest.Mock;
const mockedUseUserDetails = useUserDetails as jest.Mock;
const mockedUseDownloadCertificate = useDownloadCertificate as jest.Mock;
const mockedDownloadFile = downloadFile as jest.Mock;

describe('CertificateNameConfirmDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnDownloadSuccess = jest.fn();
  const mockDownloadMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseCurrentUser.mockReturnValue({
      data: {
        id: 'user-1',
        email: 'alex@example.com',
        firstName: 'Alex',
        lastName: 'Morgan',
      },
    });
    mockedUseUserDetails.mockReturnValue({
      data: {
        first_name: 'Alex',
        last_name: 'Morgan',
        email: 'alex@example.com',
      },
      isLoading: false,
    });
    mockedUseDownloadCertificate.mockReturnValue({
      mutate: mockDownloadMutate,
      isPending: false,
    });
  });

  it('renders correctly with verified full name when user has first and last name', () => {
    render(
      <CertificateNameConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspaceId={42}
        onDownloadSuccess={mockOnDownloadSuccess}
      />,
    );

    expect(screen.getByText('Verify Certificate Name')).toBeInTheDocument();
    expect(screen.getByText('Official Certificate Verification')).toBeInTheDocument();
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText('alex@example.com')).toBeInTheDocument();
    expect(screen.getByText('Verified Full Name')).toBeInTheDocument();
    expect(screen.queryByText(/name incomplete/i)).not.toBeInTheDocument();
    expect(
      screen.getByText('Is this the exact name you want printed on your certificate?'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no, update in profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes, continue & download/i })).toBeInTheDocument();
  });

  it('displays warning banner and incomplete badge when first or last name is missing', () => {
    mockedUseUserDetails.mockReturnValue({
      data: {
        first_name: 'Alex',
        last_name: '',
        email: 'alex@example.com',
      },
      isLoading: false,
    });
    mockedUseCurrentUser.mockReturnValue({
      data: {
        id: 'user-1',
        email: 'alex@example.com',
        firstName: 'Alex',
        lastName: '',
      },
    });

    render(
      <CertificateNameConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspaceId={42}
        onDownloadSuccess={mockOnDownloadSuccess}
      />,
    );

    expect(screen.getByText('Name Incomplete')).toBeInTheDocument();
    expect(screen.getByText('Your profile name is not complete.')).toBeInTheDocument();
    expect(
      screen.getByText(
        /If you want your legal first and last name printed on this official credential/i,
      ),
    ).toBeInTheDocument();
  });

  it('navigates to settings profile tab without downloading when "No, Update in Profile" is clicked', async () => {
    const user = userEvent.setup();

    render(
      <CertificateNameConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspaceId={42}
        onDownloadSuccess={mockOnDownloadSuccess}
      />,
    );

    const noButton = screen.getByRole('button', { name: /no, update in profile/i });
    await user.click(noButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(toast.info).toHaveBeenCalledWith(
      'Redirecting to Profile. Update your First and Last Name, then return to download your certificate.',
    );
    expect(mockNavigate).toHaveBeenCalledWith('/settings?tab=profile');
    expect(mockedDownloadFile).not.toHaveBeenCalled();
    expect(mockDownloadMutate).not.toHaveBeenCalled();
  });

  it('downloads directly using initialBlobResult when provided upon clicking "Yes, Continue & Download"', async () => {
    const user = userEvent.setup();
    const fakeBlob = new Blob(['sample-cert-pdf'], { type: 'application/pdf' });
    const blobResult = {
      blob: fakeBlob,
      filename: 'custom_cert_42.pdf',
    };

    render(
      <CertificateNameConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspaceId={42}
        initialBlobResult={blobResult}
        onDownloadSuccess={mockOnDownloadSuccess}
      />,
    );

    const yesButton = screen.getByRole('button', { name: /yes, continue & download/i });
    await user.click(yesButton);

    expect(mockedDownloadFile).toHaveBeenCalledWith(
      fakeBlob,
      'custom_cert_42.pdf',
      'application/pdf',
    );
    expect(toast.success).toHaveBeenCalledWith('Certificate downloaded successfully!');
    expect(mockOnDownloadSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockDownloadMutate).not.toHaveBeenCalled();
  });

  it('falls back to useDownloadCertificate mutation when initialBlobResult is not present', async () => {
    const user = userEvent.setup();
    mockDownloadMutate.mockImplementation((_args, options) => {
      options?.onSuccess?.();
    });

    render(
      <CertificateNameConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        workspaceId={42}
        onDownloadSuccess={mockOnDownloadSuccess}
      />,
    );

    const yesButton = screen.getByRole('button', { name: /yes, continue & download/i });
    await user.click(yesButton);

    expect(mockDownloadMutate).toHaveBeenCalledTimes(1);
    expect(mockOnDownloadSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes when the X button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <CertificateNameConfirmDialog open={true} onOpenChange={mockOnOpenChange} workspaceId={42} />,
    );

    const closeButton = screen.getByLabelText(/close dialog/i);
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
