import { FileText, Image, Loader2, Mic, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import {
  BACKEND_SUPPORTED_FILE_TYPES,
  type SupportedFileTypeOption,
} from '@/constants/attachments';
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
  supportedFileTypes?: SupportedFileTypeOption[];
}

const DEFAULT_ALL_ACCEPT = BACKEND_SUPPORTED_FILE_TYPES.map((t) => t.accept).join(',');

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onAttach,
  attachments = [],
  onRemoveAttachment,
  disabled,
  placeholder,
  supportedFileTypes = BACKEND_SUPPORTED_FILE_TYPES,
}: ChatInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentAccept, setCurrentAccept] = useState<string>(DEFAULT_ALL_ACCEPT);
  const menuRef = useRef<HTMLDivElement>(null);
  const attachButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        attachButtonRef.current &&
        !attachButtonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

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

  const handleSelectFileType = (typeOption: SupportedFileTypeOption) => {
    setIsMenuOpen(false);
    setCurrentAccept(typeOption.accept);
    // Open the native file picker
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
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
                  className="text-muted-foreground hover:text-foreground ml-1.5 cursor-pointer focus:outline-none"
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
        placeholder={placeholder ?? 'Describe your Idea...'}
        rows={1}
        style={{ minHeight: '30px', maxHeight: '200px' }}
        className="text-foreground placeholder:text-muted-foreground w-full resize-none overflow-y-auto border-none bg-transparent p-0 text-sm font-normal shadow-none outline-none focus:ring-0"
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
        <div className="text-foreground flex items-center gap-1">
          {onAttach && (
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={currentAccept}
                className="hidden"
                onChange={(event) => {
                  if (event.target.files?.length) onAttach(event.target.files);
                  event.target.value = '';
                }}
              />
              <Button
                ref={attachButtonRef}
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Attach files"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                disabled={disabled}
              >
                <Paperclip className="size-4" />
              </Button>

              {isMenuOpen && (
                <div
                  ref={menuRef}
                  role="menu"
                  aria-label="Select file type to upload"
                  className="bg-popover text-popover-foreground border-border/80 animate-in fade-in zoom-in-95 absolute bottom-full left-0 z-50 mb-2 min-w-[210px] overflow-hidden rounded-xl border p-1.5 shadow-lg backdrop-blur-xs duration-100 select-none"
                >
                  <div className="text-muted-foreground px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
                    Select File Type
                  </div>
                  {supportedFileTypes.map((typeOption) => (
                    <button
                      key={typeOption.id}
                      type="button"
                      role="menuitem"
                      onClick={() => handleSelectFileType(typeOption)}
                      className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
                    >
                      {typeOption.id === 'image' ? (
                        <Image className="size-4 shrink-0 text-blue-500" />
                      ) : typeOption.id === 'pdf' ? (
                        <FileText className="size-4 shrink-0 text-red-500" />
                      ) : (
                        <FileText className="size-4 shrink-0 text-orange-500" />
                      )}
                      <div className="flex flex-col text-left">
                        <span className="text-foreground">{typeOption.label}</span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {typeOption.sublabel}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
          className="cursor-pointer gap-1.5 bg-[#FF4500] font-semibold text-white hover:bg-[#FF4500]/90"
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
