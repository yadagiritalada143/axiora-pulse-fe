import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useTheme } from '@hooks/useTheme';
import SettingsPage from '@pages/SettingsPage';

jest.mock('@hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = useTheme as jest.Mock;

describe('SettingsPage', () => {
  const setTheme = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page header and appearance options', () => {
    mockedUseTheme.mockReturnValue({ theme: 'system', setTheme });

    render(<SettingsPage />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
  });

  it('calls setTheme when a theme option is clicked', async () => {
    const user = userEvent.setup();
    mockedUseTheme.mockReturnValue({ theme: 'system', setTheme });

    render(<SettingsPage />);

    await user.click(screen.getByRole('button', { name: /dark/i }));

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('highlights the active theme option', () => {
    mockedUseTheme.mockReturnValue({ theme: 'dark', setTheme });

    render(<SettingsPage />);

    const darkButton = screen.getByRole('button', { name: /dark/i });
    const lightButton = screen.getByRole('button', { name: /light/i });

    expect(darkButton.className).toContain('bg-primary');
    expect(lightButton.className).not.toContain('bg-primary');
  });
});
