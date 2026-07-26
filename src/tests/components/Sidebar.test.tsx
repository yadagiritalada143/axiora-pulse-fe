import { render, screen } from '@testing-library/react';
import { LayoutDashboard, Settings } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';

import { Sidebar, type SidebarNavItem } from '@components/layout/Sidebar';
import { useUIStore } from '@store/ui.store';

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Settings', href: '/settings', icon: Settings },
];

describe('Sidebar', () => {
  const initialUIState = useUIStore.getState();

  afterEach(() => {
    useUIStore.setState(initialUIState, true);
  });

  it('renders every nav item as a link to its href', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar navItems={navItems} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
  });

  it('marks the link matching the current route as active', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Sidebar navItems={navItems} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /settings/i })).toHaveClass('bg-sidebar-accent');
    expect(screen.getByRole('link', { name: /dashboard/i })).not.toHaveClass('bg-sidebar-accent');
  });

  it('renders footer items when provided', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar
          navItems={navItems}
          footerItems={[{ label: 'Help', href: '/help', icon: Settings }]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /help/i })).toHaveAttribute('href', '/help');
  });

  it('renders the provided logo content', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar navItems={navItems} logo={<span>Axiora</span>} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Axiora')).toBeInTheDocument();
  });

  it('collapses labels but keeps icons when the sidebar is closed', () => {
    useUIStore.setState({ isSidebarOpen: false });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar navItems={navItems} />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
