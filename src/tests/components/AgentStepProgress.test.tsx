import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AgentStepProgress } from '@features/workspace/components/AgentStepProgress';
import { AGENT_STEPS, getStepFromWorkspaceState } from '@features/workspace/utils/agentStep.utils';

describe('AgentStepProgress', () => {
  it('defaults to step 1 when currentStep is not provided', () => {
    render(<AgentStepProgress />);

    expect(screen.getByText('1/11 Steps')).toBeInTheDocument();
  });

  it('renders all 11 step names from the lifecycle design', () => {
    render(<AgentStepProgress currentStep={2} />);

    AGENT_STEPS.forEach((step) => {
      expect(screen.getAllByText(step.name).length).toBeGreaterThan(0);
    });
  });

  it('highlights the active step and shows tick for completed steps', () => {
    const { container } = render(<AgentStepProgress currentStep={2} />);

    // Step 1 should be completed (rendering check icon)
    // Step 2 should be active (displaying text 2)
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);

    // Verify SVG icon for completed step 1 exists
    const checkIcon = container.querySelector('svg');
    expect(checkIcon).toBeInTheDocument();
  });

  it('maps workspace mentor state values to step numbers correctly', () => {
    expect(getStepFromWorkspaceState('GATHERING_INFO')).toBe(1);
    expect(getStepFromWorkspaceState('READY_TO_VALIDATE')).toBe(2);
    expect(getStepFromWorkspaceState('VALIDATING')).toBe(2);
    expect(getStepFromWorkspaceState('VALIDATED')).toBe(3);
    expect(getStepFromWorkspaceState(undefined)).toBe(1);
  });

  it('toggles the mobile collapsed pipeline open and closed on click', async () => {
    const user = userEvent.setup();
    render(<AgentStepProgress currentStep={2} />);

    const toggle = screen.getByText('Agent Workflow').closest('button');
    expect(toggle).toBeInTheDocument();
    if (!toggle) throw new Error('toggle button not found');

    const chevron = () => {
      const svgs = toggle.querySelectorAll('svg');
      return svgs[svgs.length - 1];
    };
    expect(chevron()).toHaveClass('lucide-chevron-down');

    expect(screen.queryByText('Completed')).not.toBeInTheDocument();

    await user.click(toggle);

    expect(chevron()).toHaveClass('lucide-chevron-up');
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);

    await user.click(toggle);

    expect(chevron()).toHaveClass('lucide-chevron-down');
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
  });

  it('expands and collapses a step to reveal its detail bullets on the desktop pipeline', async () => {
    const user = userEvent.setup();
    render(<AgentStepProgress currentStep={2} />);

    const [firstStep] = AGENT_STEPS;
    if (!firstStep) throw new Error('AGENT_STEPS is empty');

    const firstDetail = firstStep.details[0];
    if (!firstDetail) throw new Error('firstStep.details is empty');

    const stepButton = screen.getByRole('button', { name: new RegExp(firstStep.name, 'i') });

    expect(screen.queryByText(`• ${firstDetail}`)).not.toBeInTheDocument();

    await user.click(stepButton);

    expect(screen.getByText(`• ${firstDetail}`)).toBeInTheDocument();

    await user.click(stepButton);

    expect(screen.queryByText(`• ${firstDetail}`)).not.toBeInTheDocument();
  });

  it('falls back to the step-1 label when currentStep does not match a known step', () => {
    render(<AgentStepProgress currentStep={99} />);

    expect(screen.getAllByText('Idea Validation').length).toBeGreaterThan(0);
  });

  it('renders Active when isRunning is false and Running when isRunning is true', () => {
    const { rerender } = render(<AgentStepProgress currentStep={1} isRunning={false} />);
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
    expect(screen.queryByText('Running')).not.toBeInTheDocument();

    rerender(<AgentStepProgress currentStep={1} isRunning={true} />);
    expect(screen.getAllByText('Running').length).toBeGreaterThan(0);
  });
});
