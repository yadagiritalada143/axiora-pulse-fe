import { FileText, Image, Loader2, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef, type KeyboardEvent } from 'react';

import { Button } from '@components/ui/button';

export interface ChatAttachment {
  id: string | number;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'doc' | 'link';
  isUploading?: boolean;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAttach?: (files: FileList) => void;
  attachments?: ChatAttachment[];
  onRemoveAttachment?: (id: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onAttach,
  attachments = [],
  onRemoveAttachment,
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
      const isUploading = attachments.some((att) => att.isUploading);
      if ((value.trim() || attachments.length > 0) && !disabled && !isUploading) onSubmit();
    }
  };

  const isUploadingAny = attachments.some((att) => att.isUploading);

  return (
    <div className="border-input bg-background rounded-lg border p-3 shadow-sm">
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="bg-muted/40 border-border relative flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
            >
              {file.isUploading ? (
                <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
              ) : file.type === 'image' ? (
                <Image className="h-3.5 w-3.5 text-blue-500" />
              ) : file.type === 'pdf' ? (
                <FileText className="h-3.5 w-3.5 text-red-500" />
              ) : file.type === 'link' ? (
                <FileText className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-orange-500" />
              )}
              <span className="text-foreground max-w-[120px] truncate font-medium">
                {file.name}
              </span>
              {onRemoveAttachment && (
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(file.id)}
                  className="text-muted-foreground hover:text-foreground ml-1.5 focus:outline-none"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

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
        <div className="flex items-center gap-1">
          {onAttach && (
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
                disabled={disabled}
              >
                <Paperclip className="size-4" />
              </Button>
            </>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          className="gap-1.5 bg-[#FF4500] font-semibold text-white hover:bg-[#FF4500]/90"
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- boolean OR, not a fallback
          disabled={disabled || (!value.trim() && attachments.length === 0) || isUploadingAny}
          onClick={onSubmit}
        >
          Send
          <Send className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
