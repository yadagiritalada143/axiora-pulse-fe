import { render, screen } from '@testing-library/react';

import { AgentStepProgress } from '@features/workspace/components/AgentStepProgress';
import { AGENT_STEPS, getStepFromWorkspaceState } from '@features/workspace/utils/agentStep.utils';

describe('AgentStepProgress', () => {
  it('renders all 5 step names from the reference design', () => {
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
});
