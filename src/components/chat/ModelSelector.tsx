import type { AIModel } from '@/types/chat.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';

interface ModelSelectorProps {
  models: AIModel[];
  selectedModelId: string | null;
  onChange: (modelId: string) => void;
}

/** Lets the user pick which AI model/provider handles the conversation - the seam for future multi-provider support. */
export function ModelSelector({ models, selectedModelId, onChange }: ModelSelectorProps) {
  return (
    <Select value={selectedModelId ?? undefined} onValueChange={onChange}>
      <SelectTrigger className="w-48" aria-label="Select AI model">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
