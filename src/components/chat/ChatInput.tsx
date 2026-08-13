import { FileText, Image, Loader2, Mic, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';

export interface ChatAttachment {
  id: string | number;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'doc' | 'link';
  isUploading?: boolean;
  base64Data?: string;
  mimeType?: string;
}

const MAX_RECORDING_MS = 20_000;

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
  const [isListening, setIsListening] = useState(false);

  interface SpeechRecognitionAlternative {
    transcript: string;
  }

  type SpeechRecognitionResult = Record<number, SpeechRecognitionAlternative> & {
    isFinal: boolean;
  };
  interface SpeechRecognitionResultList {
    length: number;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
  }
  interface SpeechRecognitionErrorEvent {
    error: string;
  }
  interface ISpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
  }

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRecordingTimeout = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  const SpeechRecognitionConstructor =
    typeof window !== 'undefined'
      ? ((window as unknown as { SpeechRecognition: new () => ISpeechRecognition })
          .SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition: new () => ISpeechRecognition })
          .webkitSpeechRecognition)
      : null;

  const isSpeechSupported = !!SpeechRecognitionConstructor;

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearRecordingTimeout();
    };
  }, []);

  const toggleListening = () => {
    if (!SpeechRecognitionConstructor) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        let accumulatedText = value;

        recognition.onstart = () => {
          setIsListening(true);
          clearRecordingTimeout();
          recordingTimeoutRef.current = setTimeout(() => {
            recognitionRef.current?.stop();
          }, MAX_RECORDING_MS);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let newText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result?.[0]?.transcript;
            if (result?.isFinal && transcript) {
              newText = newText ? `${newText} ${transcript}` : transcript;
            }
          }
          if (newText) {
            accumulatedText = accumulatedText.trim()
              ? `${accumulatedText.trim()} ${newText}`
              : newText;
            onChange(accumulatedText);
          }
        };

        recognition.onerror = (err: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', err.error);
          clearRecordingTimeout();
          setIsListening(false);
        };

        recognition.onend = () => {
          clearRecordingTimeout();
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
        setIsListening(false);
      }
    }
  };
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

      {isListening && (
        <div className="my-2 flex items-center gap-2 px-1 text-xs font-medium text-red-500">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
          </span>
          <span className="animate-pulse">Listening...</span>
        </div>
      )}

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

          {isSpeechSupported && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isListening ? 'Stop voice typing' : 'Start voice typing'}
              onClick={toggleListening}
              disabled={disabled}
              className={cn(
                'transition-all duration-200',
                isListening &&
                  'scale-105 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600',
              )}
            >
              <Mic className={cn('size-4', isListening && 'animate-pulse')} />
            </Button>
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
