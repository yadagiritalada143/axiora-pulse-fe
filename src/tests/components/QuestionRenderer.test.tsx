import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import type { InteractiveQuestion, InteractiveQuestionType } from '@/types/onboarding.types';
import { QuestionRenderer } from '@features/onboarding/components/QuestionRenderer';

function makeQuestion(overrides: Partial<InteractiveQuestion> = {}): InteractiveQuestion {
  return {
    id: 1,
    question: 'Sample question?',
    answer_type: 'textarea',
    optional: false,
    answers: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function ControlledRenderer({
  question,
  initial = [],
}: {
  question: InteractiveQuestion;
  initial?: string[];
}) {
  const [value, setValue] = useState<string[]>(initial);
  return <QuestionRenderer question={question} value={value} onChange={setValue} />;
}

describe('QuestionRenderer', () => {
  describe('text', () => {
    const question = makeQuestion({ answer_type: 'textarea' });

    it('accumulates the typed value', async () => {
      const user = userEvent.setup();
      render(<ControlledRenderer question={question} />);

      const input = screen.getByPlaceholderText('Type your answer here');
      await user.type(input, 'Hi');

      expect(input).toHaveValue('Hi');
    });

    it('emits an empty array once cleared', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<QuestionRenderer question={question} value={['Hi']} onChange={onChange} />);

      await user.clear(screen.getByPlaceholderText('Type your answer here'));

      expect(onChange).toHaveBeenLastCalledWith([]);
    });
  });

  describe('radio', () => {
    const question = makeQuestion({
      answer_type: 'radiobuttons',
      answers: ['Founder', 'Engineer'],
    });

    it('selects a regular option', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<QuestionRenderer question={question} value={[]} onChange={onChange} />);

      await user.click(screen.getByRole('radio', { name: 'Founder' }));

      expect(onChange).toHaveBeenCalledWith(['Founder']);
    });

    it('auto-selects Other while typing free text', async () => {
      const user = userEvent.setup();
      render(<ControlledRenderer question={question} />);

      const otherInput = screen.getByRole('textbox');
      await user.type(otherInput, 'Growth Lead');

      expect(screen.getByRole('radio', { name: /others/i })).toBeChecked();
      expect(otherInput).toHaveValue('Growth Lead');
    });

    it('shows an empty Other box once a regular option is selected instead', () => {
      const { rerender } = render(
        <QuestionRenderer question={question} value={['other', 'X']} onChange={jest.fn()} />,
      );
      expect(screen.getByRole('textbox')).toHaveValue('X');

      rerender(<QuestionRenderer question={question} value={['Founder']} onChange={jest.fn()} />);

      expect(screen.getByRole('textbox')).toHaveValue('');
      expect(screen.getByRole('radio', { name: 'Founder' })).toBeChecked();
    });

    it('selects Other by clicking its radio directly', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<QuestionRenderer question={question} value={[]} onChange={onChange} />);

      await user.click(screen.getByRole('radio', { name: /others/i }));

      expect(onChange).toHaveBeenCalledWith(['other', '']);
    });

    it('defaults the Other box to empty when no text was ever recorded', () => {
      render(<QuestionRenderer question={question} value={['other']} onChange={jest.fn()} />);

      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('falls back to no options when the question has none', () => {
      render(
        <QuestionRenderer
          question={makeQuestion({ answer_type: 'radiobuttons' })}
          value={[]}
          onChange={jest.fn()}
        />,
      );

      expect(screen.getByRole('radio', { name: /others/i })).toBeInTheDocument();
      expect(screen.queryAllByRole('radio')).toHaveLength(1);
    });
  });

  describe('multi_select', () => {
    const question = makeQuestion({
      answer_type: 'checkboxes',
      answers: ['Validate my idea', 'Find co-founders'],
    });

    it('toggles regular options independently', async () => {
      const user = userEvent.setup();
      render(<ControlledRenderer question={question} />);

      await user.click(screen.getByRole('checkbox', { name: 'Validate my idea' }));
      expect(screen.getByRole('checkbox', { name: 'Validate my idea' })).toBeChecked();

      await user.click(screen.getByRole('checkbox', { name: 'Find co-founders' }));
      expect(screen.getByRole('checkbox', { name: 'Find co-founders' })).toBeChecked();

      await user.click(screen.getByRole('checkbox', { name: 'Validate my idea' }));
      expect(screen.getByRole('checkbox', { name: 'Validate my idea' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Find co-founders' })).toBeChecked();
    });

    it('checks Other automatically while typing, alongside existing selections', async () => {
      const user = userEvent.setup();
      render(<ControlledRenderer question={question} />);

      await user.click(screen.getByRole('checkbox', { name: 'Validate my idea' }));
      const otherInput = screen.getByRole('textbox');
      await user.type(otherInput, 'Learn from founders');

      expect(screen.getByRole('checkbox', { name: /others/i })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Validate my idea' })).toBeChecked();
      expect(otherInput).toHaveValue('Learn from founders');
    });

    it('drops the Other text from the encoded value when unchecked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <QuestionRenderer
          question={question}
          value={['Validate my idea', 'other', 'Learn from founders']}
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole('checkbox', { name: /others/i }));

      expect(onChange).toHaveBeenCalledWith(['Validate my idea']);
    });

    it('treats a missing Other text entry as empty', () => {
      render(
        <QuestionRenderer
          question={question}
          value={['Validate my idea', 'other']}
          onChange={jest.fn()}
        />,
      );

      expect(screen.getByRole('checkbox', { name: /others/i })).toBeChecked();
      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('falls back to no options when the question has none', () => {
      render(
        <QuestionRenderer
          question={makeQuestion({ answer_type: 'checkboxes' })}
          value={[]}
          onChange={jest.fn()}
        />,
      );

      expect(screen.queryAllByRole('checkbox')).toHaveLength(1);
    });
  });

  describe('dropdown', () => {
    const question = makeQuestion({
      answer_type: 'dropdown',
      answers: ['SaaS', 'Fintech'],
    });

    it('selects a regular option', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<QuestionRenderer question={question} value={[]} onChange={onChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByRole('option', { name: 'SaaS' }));

      expect(onChange).toHaveBeenCalledWith(['SaaS']);
    });

    it('reveals a free-text field for Other and captures typed text', async () => {
      const user = userEvent.setup();
      render(<ControlledRenderer question={question} />);

      expect(screen.queryByPlaceholderText('Please specify')).not.toBeInTheDocument();

      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByRole('option', { name: 'Other' }));

      const otherInput = screen.getByPlaceholderText('Please specify');
      await user.type(otherInput, 'Deep tech');

      expect(otherInput).toHaveValue('Deep tech');
    });

    it('defaults the Other box to empty when no text was ever recorded', () => {
      render(<QuestionRenderer question={question} value={['other']} onChange={jest.fn()} />);

      expect(screen.getByPlaceholderText('Please specify')).toHaveValue('');
    });

    it('falls back to no options when the question has none', async () => {
      const user = userEvent.setup();
      render(
        <QuestionRenderer
          question={makeQuestion({ answer_type: 'dropdown' })}
          value={[]}
          onChange={jest.fn()}
        />,
      );

      await user.click(screen.getByRole('combobox'));

      expect(await screen.findByRole('option', { name: 'Other' })).toBeInTheDocument();
      expect(screen.queryAllByRole('option')).toHaveLength(1);
    });
  });

  it('renders nothing for an unrecognized question type', () => {
    const question = makeQuestion({
      answer_type: 'unsupported' as unknown as InteractiveQuestionType,
    });
    const { container } = render(
      <QuestionRenderer question={question} value={[]} onChange={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
