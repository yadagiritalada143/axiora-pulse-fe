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

interface QuestionRendererProps {
  question: InteractiveQuestion;
  value: string[];
  onChange: (value: string[]) => void;
}

const optionRowClass = cn(
  'has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors',
);

const optionGridClass = 'grid grid-cols-1 gap-3 sm:grid-cols-2';

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  switch (question.answer_type) {
    case 'textarea':
      return (
        <Input
          placeholder="Type your answer here"
          value={value[0] ?? ''}
          onChange={(event) => onChange(event.target.value ? [event.target.value] : [])}
        />
      );

    case 'radiobuttons': {
      return (
        <RadioGroup
          value={value[0] ?? ''}
          onValueChange={(next) => onChange([next])}
          className={optionGridClass}
        >
          {(question.answers ?? []).map((option) => (
            <label key={option} className={optionRowClass}>
              <RadioGroupItem value={option} />
              {option}
            </label>
          ))}
        </RadioGroup>
      );
    }

    case 'checkboxes': {
      const toggleOption = (option: string) => {
        const nextValue = value.includes(option)
          ? value.filter((v) => v !== option)
          : [...value, option];
        onChange(nextValue);
      };

      return (
        <div className={optionGridClass}>
          {(question.answers ?? []).map((option) => (
            <label key={option} className={optionRowClass}>
              <Checkbox
                checked={value.includes(option)}
                onCheckedChange={() => toggleOption(option)}
              />
              {option}
            </label>
          ))}
        </div>
      );
    }

    case 'dropdown': {
      return (
        <div className="grid gap-3">
          <Select value={value[0] ?? ''} onValueChange={(next) => onChange([next])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(question.answers ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    default:
      return null;
  }
}
