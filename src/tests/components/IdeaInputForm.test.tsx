import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { OrchestrationRunResponse } from '@/types/orchestration.types';
import { IdeaInputForm } from '@features/ideaValidation/components/IdeaInputForm';
import { useRunOrchestration } from '@features/ideaValidation/hooks';

jest.mock('@features/ideaValidation/hooks', () => ({
  useRunOrchestration: jest.fn(),
}));

const mockedUseRunOrchestration = useRunOrchestration as jest.Mock;

const WORKSPACE_ID = 'workspace-1';

const RESPONSE: OrchestrationRunResponse = {
  run_id: 'run-1',
  workspace_id: '1',
  idea_id: '1',
  workflow_type: 'idea_validation',
  status: 'completed',
  result: null,
  error: null,
  started_at: '2026-01-01T00:00:00.000Z',
  completed_at: '2026-01-01T00:01:00.000Z',
};

function setupHook(
  overrides: {
    mutate?: jest.Mock;
    isPending?: boolean;
    error?: unknown;
  } = {},
) {
  const mutate = overrides.mutate ?? jest.fn();

  mockedUseRunOrchestration.mockReturnValue({
    mutate,
    isPending: overrides.isPending ?? false,
    error: overrides.error ?? null,
  });

  return mutate;
}

function renderForm(props: Partial<React.ComponentProps<typeof IdeaInputForm>> = {}) {
  return render(<IdeaInputForm workspaceId={WORKSPACE_ID} onValidated={jest.fn()} {...props} />);
}

describe('IdeaInputForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('disables Continue until both title and description are filled in', async () => {
    setupHook();

    const user = userEvent.setup();

    renderForm();

    for (const button of screen.getAllByRole('button', { name: 'Continue' })) {
      expect(button).toBeDisabled();
    }

    await user.type(screen.getByLabelText('Idea Title'), 'Inventory AI');

    for (const button of screen.getAllByRole('button', { name: 'Continue' })) {
      expect(button).toBeDisabled();
    }

    await user.type(screen.getByLabelText('Describe your startup Idea….'), 'Forecasting tool');

    expect(screen.getAllByRole('button', { name: 'Continue' })[0]).toBeEnabled();
  });

  it('submits the trimmed idea payload and calls onValidated with the mutation result', async () => {
    const mutate = jest.fn(
      (_payload, options: { onSuccess: (response: typeof RESPONSE) => void }) => {
        options.onSuccess(RESPONSE);
      },
    );

    setupHook({ mutate });

    const onValidated = jest.fn();
    const user = userEvent.setup();

    renderForm({ onValidated });

    await user.type(screen.getByLabelText('Idea Title'), '  Inventory AI  ');

    await user.type(
      screen.getByLabelText('Describe your startup Idea….'),
      'Forecasting for retailers',
    );

    const continueButton = screen.getAllByRole('button', {
      name: 'Continue',
    })[0];

    if (!continueButton) {
      throw new Error('Expected a Continue button to be in the document');
    }

    await user.click(continueButton);

    expect(mutate).toHaveBeenCalledTimes(1);

    const call = mutate.mock.calls[0];

    if (!call) {
      throw new Error('Expected the mutation to have been called');
    }

    const payload = call[0] as {
      idea: {
        idea_title: string;
        idea_description: string;
      };
    };

    expect(payload.idea.idea_title).toBe('Inventory AI');
    expect(payload.idea.idea_description).toBe('Forecasting for retailers');

    expect(onValidated).toHaveBeenCalledWith(RESPONSE, 'Inventory AI');
  });

  it('shows a pending state and disables inputs while the mutation is running', () => {
    setupHook({ isPending: true });

    renderForm();

    expect(screen.getAllByRole('button', { name: 'Validating…' })[0]).toBeInTheDocument();

    expect(screen.getByLabelText('Idea Title')).toBeDisabled();
    expect(screen.getByLabelText('Describe your startup Idea….')).toBeDisabled();
  });

  it('renders an API error message when the mutation fails', () => {
    setupHook({
      error: {
        status: 500,
        code: 'SERVER_ERROR',
        message: 'Something went wrong.',
      },
    });

    renderForm();

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
  });
});
