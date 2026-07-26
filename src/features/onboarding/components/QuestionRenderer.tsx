import type { InteractiveQuestion } from '@/types/onboarding.types';
import { Checkbox } from '@components/ui/checkbox';
import { Input } from '@components/ui/input';
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { cn } from '@lib/utils';

const OTHER_VALUE = 'other';

interface QuestionRendererProps {
  question: InteractiveQuestion;
  value: string[];
  onChange: (value: string[]) => void;
}

const optionRowClass = cn(
  'has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors',
);

const optionGridClass = 'grid grid-cols-1 gap-3 sm:grid-cols-2';

const otherInputClass =
  'text-foreground placeholder:text-muted-foreground min-w-0 flex-1 border-0 border-b border-dashed bg-transparent px-1 pb-0.5 text-sm outline-none focus-visible:border-foreground';

/** Multi-select stores an optional "Other" entry as a trailing `['other', text]` pair. */
function splitOtherFromMulti(value: string[]): {
  selections: string[];
  otherChecked: boolean;
  otherText: string;
} {
  const otherIndex = value.indexOf(OTHER_VALUE);
  if (otherIndex === -1) return { selections: value, otherChecked: false, otherText: '' };
  return {
    selections: value.slice(0, otherIndex),
    otherChecked: true,
    otherText: value[otherIndex + 1] ?? '',
  };
}

function buildMultiValue(selections: string[], otherChecked: boolean, otherText: string): string[] {
  return otherChecked ? [...selections, OTHER_VALUE, otherText] : selections;
}

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  switch (question.question_type) {
    case 'text':
      return (
        <Input
          placeholder="Type your answer here"
          value={value[0] ?? ''}
          onChange={(event) => onChange(event.target.value ? [event.target.value] : [])}
        />
      );

    case 'radio': {
      const isOther = value[0] === OTHER_VALUE;
      const selected = isOther ? OTHER_VALUE : (value[0] ?? '');

      return (
        <RadioGroup
          value={selected}
          onValueChange={(next) => onChange(next === OTHER_VALUE ? [OTHER_VALUE, ''] : [next])}
          className={optionGridClass}
        >
          {(question.answers ?? []).map((option) => (
            <label key={option} className={optionRowClass}>
              <RadioGroupItem value={option} />
              {option}
            </label>
          ))}

          <label className={optionRowClass}>
            <RadioGroupItem value={OTHER_VALUE} />
            <span className="shrink-0">Others:</span>
            <input
              type="text"
              value={isOther ? (value[1] ?? '') : ''}
              onChange={(event) => onChange([OTHER_VALUE, event.target.value])}
              className={otherInputClass}
            />
          </label>
        </RadioGroup>
      );
    }

    case 'multi_select': {
      const { selections, otherChecked, otherText } = splitOtherFromMulti(value);

      const toggleOption = (option: string) => {
        const nextSelections = selections.includes(option)
          ? selections.filter((v) => v !== option)
          : [...selections, option];
        onChange(buildMultiValue(nextSelections, otherChecked, otherText));
      };

      return (
        <div className={optionGridClass}>
          {(question.answers ?? []).map((option) => (
            <label key={option} className={optionRowClass}>
              <Checkbox
                checked={selections.includes(option)}
                onCheckedChange={() => toggleOption(option)}
              />
              {option}
            </label>
          ))}

          <label className={optionRowClass}>
            <Checkbox
              checked={otherChecked}
              onCheckedChange={(checked) =>
                onChange(buildMultiValue(selections, checked === true, otherText))
              }
            />
            <span className="shrink-0">Others:</span>
            <input
              type="text"
              value={otherText}
              onChange={(event) => onChange(buildMultiValue(selections, true, event.target.value))}
              className={otherInputClass}
            />
          </label>
        </div>
      );
    }

    case 'dropdown': {
      const isOther = value[0] === OTHER_VALUE;
      const selected = isOther ? OTHER_VALUE : (value[0] ?? '');

      return (
        <div className="grid gap-3">
          <Select
            value={selected}
            onValueChange={(next) => onChange(next === OTHER_VALUE ? [OTHER_VALUE, ''] : [next])}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(question.answers ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
              <SelectItem value={OTHER_VALUE}>Other</SelectItem>
            </SelectContent>
          </Select>

          {isOther && (
            <Input
              placeholder="Please specify"
              value={value[1] ?? ''}
              onChange={(event) => onChange([OTHER_VALUE, event.target.value])}
            />
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
