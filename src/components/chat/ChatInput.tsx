import { Paperclip, Send } from 'lucide-react';
import { useEffect, useRef, type KeyboardEvent } from 'react';

import { Button } from '@components/ui/button';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAttach?: (files: FileList) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onAttach,
  disabled,
  placeholder,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (value.trim() && !disabled) onSubmit();
    }
  };

  return (
    <div className="border-input bg-background rounded-lg border p-3 shadow-sm">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Describe your startup idea...'}
        rows={1}
        style={{ minHeight: '30px', maxHeight: '200px' }}
        className="w-full resize-none overflow-y-auto border-none bg-transparent p-0 text-sm shadow-none outline-none focus:ring-0"
        disabled={disabled}
      />

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onAttach ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files?.length) onAttach(event.target.files);
                  event.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Attach files"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="size-4" />
              </Button>
            </>
          ) : null}
        </div>

        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- boolean OR, not a fallback
          disabled={disabled || !value.trim()}
          onClick={onSubmit}
        >
          Send
          <Send className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
