import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AIModel } from '@/types/chat.types';
import { ModelSelector } from '@components/chat/ModelSelector';

const models: AIModel[] = [
  {
    id: 'model-1',
    label: 'Axiora Fast',
    provider: 'axiora',
    description: 'Quick responses',
    isDefault: true,
  },
  {
    id: 'model-2',
    label: 'Axiora Pro',
    provider: 'axiora',
    description: 'Deeper reasoning',
    isDefault: false,
  },
];

// Radix `Select` relies on pointer-capture and scroll APIs jsdom doesn't implement.
beforeAll(() => {
  Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
  Element.prototype.setPointerCapture = jest.fn();
  Element.prototype.releasePointerCapture = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
});

describe('ModelSelector', () => {
  it('renders the trigger with a placeholder when no model is selected', () => {
    render(<ModelSelector models={models} selectedModelId={null} onChange={jest.fn()} />);

    expect(screen.getByRole('combobox', { name: 'Select AI model' })).toHaveTextContent(
      'Select a model',
    );
  });

  it('renders the selected model label in the trigger', () => {
    render(<ModelSelector models={models} selectedModelId="model-2" onChange={jest.fn()} />);

    expect(screen.getByRole('combobox', { name: 'Select AI model' })).toHaveTextContent(
      'Axiora Pro',
    );
  });

  it('calls onChange with the selected model id when an option is picked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ModelSelector models={models} selectedModelId="model-1" onChange={onChange} />);

    await user.click(screen.getByRole('combobox', { name: 'Select AI model' }));
    const option = await screen.findByRole('option', { name: 'Axiora Pro' });
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith('model-2');
  });
});
