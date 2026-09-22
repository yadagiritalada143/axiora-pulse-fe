import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AgentStepProgress } from '@features/workspace/components/AgentStepProgress';
import * as liveStateHook from '@features/workspace/hooks/useWorkspaceLiveState';
import type { WorkspaceLiveStateResponse } from '@features/workspace/types';
import { AGENT_STEPS, getStepFromWorkspaceState } from '@features/workspace/utils/agentStep.utils';

describe('AgentStepProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    expect(getStepFromWorkspaceState('READY_TO_VALIDATE')).toBe(1);
    expect(getStepFromWorkspaceState('VALIDATING')).toBe(1);
    expect(getStepFromWorkspaceState('VALIDATED')).toBe(2);
    expect(getStepFromWorkspaceState(undefined)).toBe(1);
  });

  it('toggles the mobile collapsed pipeline open and closed on click', async () => {
    const user = userEvent.setup();
    render(<AgentStepProgress currentStep={2} />);

    const toggle = screen.getAllByText('Entrepreneur Journey')[0]?.closest('button');
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
    expect(screen.getAllByText('Done').length).toBeGreaterThan(0);
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

    const stepButtons = screen.getAllByRole('button', { name: new RegExp(firstStep.name, 'i') });
    const stepButton = stepButtons[stepButtons.length - 1];
    if (!stepButton) throw new Error('step button not found');

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

  it('renders Survey Intelligence as canonical Step 3 without sub-agent or sub-mentor wordings', async () => {
    const user = userEvent.setup();
    render(<AgentStepProgress currentStep={3} />);

    // Must NOT contain sub-agent or sub-mentor wordings
    expect(screen.queryByText(/sub-agent/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sub-mentor/i)).not.toBeInTheDocument();

    // Survey Intelligence is a top-level step
    expect(screen.getAllByText('Survey Intelligence').length).toBeGreaterThan(0);

    const surveyStepBtns = screen.getAllByRole('button', { name: /Survey Intelligence/i });
    const targetBtn = surveyStepBtns[surveyStepBtns.length - 1];
    if (!targetBtn) throw new Error('Survey Intelligence button not found');

    await user.click(targetBtn);

    expect(screen.getByText(/Survey question generation/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-time sentiment extraction/i)).toBeInTheDocument();
  });

  it('renders dynamic steps and execution progress from backend live state', () => {
    const mockLiveState: WorkspaceLiveStateResponse = {
      workspace_id: '42',
      mentor_state: 'VALIDATING',
      current_step_id: 2,
      current_step_name: 'Market Research & Business Model',
      steps: [
        {
          id: 1,
          name: 'Idea Validation',
          description: 'Validation complete',
          status: 'completed',
          score: 8.7,
          completed_at: '2026-09-22T00:00:00Z',
          key_activities: ['Problem identification', 'Score generation'],
        },
        {
          id: 2,
          name: 'Market Research & Business Model',
          description: 'Analyzing target market',
          status: 'active',
          score: null,
          completed_at: null,
          key_activities: ['Market sizing', 'Competitor benchmarking'],
        },
        {
          id: 3,
          name: 'Survey Intelligence',
          description: 'Survey readiness',
          status: 'pending',
          score: null,
          completed_at: null,
          key_activities: ['Survey question generation'],
        },
        {
          id: 4,
          name: 'Financial & Capital Planning',
          description: 'Future stage',
          status: 'roadmap',
          score: null,
          completed_at: null,
          key_activities: ['Runway calculation'],
        },
      ],
      execution: {
        is_running: true,
        run_id: 'run-xyz-123',
        active_agent: 'market_research_agent',
        active_agent_label: 'Market Research Specialist',
        current_action: 'Crawling competitor pricing databases...',
        progress_pct: 65,
        elapsed_seconds: 14,
        started_at: '2026-09-22T00:00:00Z',
      },
      recent_activities: ['Started validation', 'Crawling competitor pricing databases...'],
      updated_at: '2026-09-22T00:00:14Z',
    };

    jest.spyOn(liveStateHook, 'useWorkspaceLiveState').mockReturnValue({
      liveState: mockLiveState,
      isStreaming: true,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<AgentStepProgress workspaceId={42} />);

    // Checks live execution card
    expect(screen.getAllByText('Market Research Specialist').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Crawling competitor pricing databases...').length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText('65%').length).toBeGreaterThan(0);

    // Checks score badge from backend
    expect(screen.getAllByText('Score: 8.7').length).toBeGreaterThan(0);

    // Checks roadmap badge
    expect(screen.getAllByText('Roadmap').length).toBeGreaterThan(0);
  });
});
