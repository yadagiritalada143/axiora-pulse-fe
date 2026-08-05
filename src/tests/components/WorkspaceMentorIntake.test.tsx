import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WorkspaceMentorIntake } from '@features/workspace/components/WorkspaceMentorIntake';

describe('WorkspaceMentorIntake', () => {
  it('disables the continue button until both the title and description are filled in', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(<WorkspaceMentorIntake onSubmit={onSubmit} isPending={false} />);

    const continueButtons = screen.getAllByRole('button', { name: /continue/i });
    for (const button of continueButtons) {
      expect(button).toBeDisabled();
    }

    await user.type(screen.getByLabelText('Idea Title'), 'Acme Rocket');
    for (const button of screen.getAllByRole('button', { name: /continue/i })) {
      expect(button).toBeDisabled();
    }

    await user.type(
      screen.getByLabelText('Describe your startup Idea….'),
      'A rocket delivery service for small parcels.',
    );

    for (const button of screen.getAllByRole('button', { name: /continue/i })) {
      expect(button).toBeEnabled();
    }
  });

  it('submits a combined title + description message when continue is clicked', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(<WorkspaceMentorIntake onSubmit={onSubmit} isPending={false} />);

    await user.type(screen.getByLabelText('Idea Title'), 'Acme Rocket');
    await user.type(
      screen.getByLabelText('Describe your startup Idea….'),
      'A rocket delivery service.',
    );

    const visibleContinueButton = screen
      .getAllByRole('button', { name: /continue/i })
      .find((button) => !button.className.includes('hidden'));
    if (!visibleContinueButton) throw new Error('No visible continue button found');
    await user.click(visibleContinueButton);

    expect(onSubmit).toHaveBeenCalledWith('Idea title: Acme Rocket\n\nA rocket delivery service.');
  });

  it('does not submit when the fields contain only whitespace', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(<WorkspaceMentorIntake onSubmit={onSubmit} isPending={false} />);

    await user.type(screen.getByLabelText('Idea Title'), '   ');
    await user.type(screen.getByLabelText('Describe your startup Idea….'), '   ');

    for (const button of screen.getAllByRole('button', { name: /continue/i })) {
      expect(button).toBeDisabled();
    }
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a pending state and disables inputs while isPending is true', () => {
    render(<WorkspaceMentorIntake onSubmit={jest.fn()} isPending />);

    expect(screen.getByLabelText('Idea Title')).toBeDisabled();
    expect(screen.getByLabelText('Describe your startup Idea….')).toBeDisabled();
    expect(screen.getAllByText('Starting…').length).toBeGreaterThan(0);
  });

  it('renders an API error message when an error is passed', () => {
    render(
      <WorkspaceMentorIntake
        onSubmit={jest.fn()}
        isPending={false}
        error={{ status: 400, code: 'BAD_REQUEST', message: 'The idea title is required.' }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('The idea title is required.');
  });

  it('renders the example idea cards to help founders get started', () => {
    render(<WorkspaceMentorIntake onSubmit={jest.fn()} isPending={false} />);

    expect(screen.getByText('Need help getting started?')).toBeInTheDocument();
    expect(
      screen.getAllByText('AI-powered platform that helps founders validate their ideas faster.'),
    ).toHaveLength(4);
  });
});
