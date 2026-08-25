import { Loader2 } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { isApiError } from '@/types/error.types';
import type { OrchestrationRunResponse } from '@/types/orchestration.types';
import {
  ChatBubble,
  ChatInput,
  MarkdownRenderer,
  TypeOnMarkdown,
  TypingIndicator,
  type ChatAttachment,
} from '@components/chat';
import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Button } from '@components/ui/button';
import { IdeaValidationReport, WebSearchDrawer } from '@features/ideaValidation/components';

import { workspaceService } from '../api';
import { useWorkspaceChat, useWorkspaceState } from '../hooks/useWorkspaceMentor';
import { getStepFromWorkspaceState } from '../utils/agentStep.utils';

import { AgentStepProgress } from './AgentStepProgress';
import { WorkspaceMentorIntake } from './WorkspaceMentorIntake';

const VALIDATION_TRIGGER_MESSAGE = 'Run validation analysis';
const VERIFY_DETAILS_MESSAGE = 'Can you verify and summarize the idea details you have so far?';

function displayMessageContent(content: string): string {
  return content === VALIDATION_TRIGGER_MESSAGE
    ? 'Requested a market analysis validation run.'
    : content;
}

function getAttachmentType(fileName: string): 'image' | 'pdf' | 'doc' | 'link' {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext ?? '')) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext ?? '')) return 'doc';
  return 'doc';
}

const ALLOWED_ATTACHMENT_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'bmp',
  'pdf',
  'docx',
  'doc',
  'txt',
  'md',
  'rtf',
  'csv',
];
const UNSUPPORTED_ATTACHMENT_MESSAGE =
  'Only JPEG, PNG, WEBP, GIF, BMP images, PDFs, and DOCX, DOC, TXT, MD, RTF, CSV documents are allowed.';

function isAllowedAttachment(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return !!ext && ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext);
}

interface WorkspaceMentorChatProps {
  workspaceId: number;
}

export function WorkspaceMentorChat({ workspaceId }: WorkspaceMentorChatProps) {
  const { data, isLoading, isError } = useWorkspaceState(workspaceId);
  const chat = useWorkspaceChat(workspaceId);
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [typeOnAssistantMessages, setTypeOnAssistantMessages] = useState<Set<number>>(
    () => new Set(),
  );
  const [typingCompletedMessages, setTypingCompletedMessages] = useState<Set<number>>(
    () => new Set(),
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const [reportAnchorIndex, setReportAnchorIndex] = useState<number | null>(() => {
    return data?.validation_result ? data.conversation_history.length : null;
  });
  const [prevValidationResult, setPrevValidationResult] = useState<unknown>(
    data?.validation_result ?? null,
  );
  if (data?.validation_result && prevValidationResult !== data.validation_result) {
    setPrevValidationResult(data.validation_result);
    if (reportAnchorIndex === null) {
      setReportAnchorIndex(data.conversation_history.length);
    }
  }
  const [isTriggeringValidation, setIsTriggeringValidation] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.conversation_history.length, chat.isPending]);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAttach = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      if (!isAllowedAttachment(file.name)) {
        toast.error(UNSUPPORTED_ATTACHMENT_MESSAGE);
        continue;
      }

      const tempId = `temp-${Date.now()}-${i}`;

      let base64Data = '';
      try {
        base64Data = await readFileAsDataURL(file);
      } catch (e) {
        console.error('Failed to read file content to base64', e);
      }

      const newAttachment: ChatAttachment = {
        id: tempId,
        name: file.name,
        url: '',
        type: getAttachmentType(file.name),
        isUploading: true,
        base64Data,
        mimeType: file.type,
      };

      setAttachments((prev) => [...prev, newAttachment]);

      try {
        const uploaded = await workspaceService.uploadAttachment(workspaceId, file);
        setAttachments((prev) =>
          prev.map((att) =>
            att.id === tempId
              ? {
                  ...att,
                  id: uploaded.id,
                  url: uploaded.url,
                  isUploading: false,
                }
              : att,
          ),
        );
      } catch (error) {
        toast.error(isApiError(error) ? error.message : `Failed to upload ${file.name}.`);
        setAttachments((prev) => prev.filter((att) => att.id !== tempId));
      }
    }
  };

  const handleRemoveAttachment = (id: string | number) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" aria-hidden />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-muted-foreground flex h-[60vh] items-center justify-center text-sm">
        Failed to load the AI Mentor conversation. Please try again.
      </div>
    );
  }

  function send(message: string) {
    if ((!message.trim() && attachments.length === 0) || chat.isPending) return;

    let finalMessage = message.trim();
    if (attachments.length > 0) {
      const attachmentsText = attachments
        .map((att) =>
          att.type === 'image' ? `![${att.name}](${att.url})` : `[📁 ${att.name}](${att.url})`,
        )
        .join('\n');
      finalMessage = finalMessage ? `${finalMessage}\n\n${attachmentsText}` : attachmentsText;
    }

    const payloadAttachments = attachments.map((att) => ({
      type: att.type,
      name: att.name,
      url_or_data: att.base64Data ?? att.url,
      mime_type: att.mimeType ?? null,
    }));

    const nextAssistantMessageIndex = (data?.conversation_history.length ?? 0) + 1;
    setTypeOnAssistantMessages((previous) => new Set(previous).add(nextAssistantMessageIndex));

    if (finalMessage === VALIDATION_TRIGGER_MESSAGE) {
      setIsTriggeringValidation(true);
    }

    chat.mutate(
      {
        message: finalMessage,
        attachments: payloadAttachments.length > 0 ? payloadAttachments : null,
      },
      {
        onSuccess: () => {
          setIsTriggeringValidation(false);
        },
        onError: () => {
          setIsTriggeringValidation(false);
        },
      },
    );
    setDraft('');
    setAttachments([]);
  }

  const currentStep = getStepFromWorkspaceState(data.state);
  const hasStarted = data.conversation_history.length > 0;

  if (!hasStarted) {
    return (
      <div className="min-h-0 w-full flex-1 overflow-y-auto pr-1">
        <div className="mx-auto flex w-full max-w-6xl items-start gap-6 px-1 py-2">
          <div className="min-w-0 flex-1">
            <AgentStepProgress currentStep={1} className="mb-4 block lg:hidden" />
            <WorkspaceMentorIntake onSubmit={send} isPending={chat.isPending} error={chat.error} />
          </div>
          <div className="sticky top-2 hidden w-72 shrink-0 lg:block">
            <AgentStepProgress currentStep={1} />
          </div>
        </div>
      </div>
    );
  }

  const showQuickActions = data.state === 'READY_TO_VALIDATE';

  const validationResponse: OrchestrationRunResponse | null = data.validation_result
    ? {
        run_id: data.validation_result.orchestration_run_id,
        workspace_id: String(workspaceId),
        idea_id: data.validation_result.idea_id,
        workflow_type: 'idea_validation',
        status: 'success',
        result: data.validation_result,
        error: null,
        started_at: data.validation_result.created_at,
        completed_at: data.validation_result.created_at,
      }
    : null;

  const effectiveReportAnchor = reportAnchorIndex ?? data.conversation_history.length;
  const reportNode = validationResponse ? (
    <IdeaValidationReport
      workspaceId={workspaceId}
      ideaTitle={data.idea.idea_title ?? data.name}
      response={validationResponse}
    />
  ) : null;

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl min-w-0 flex-1 items-stretch gap-6 overflow-hidden">
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <AgentStepProgress
          currentStep={currentStep}
          isRunning={data.state === 'VALIDATING'}
          className="mb-4 block shrink-0 lg:hidden"
        />

        <div className="border-border flex shrink-0 items-center gap-6 border-b text-sm">
          <span className="text-primary border-primary -mb-px border-b-2 pb-2 font-medium">
            Arya
          </span>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto pt-4 pr-1 pb-4">
          {effectiveReportAnchor === 0 ? reportNode : null}

          {data.conversation_history.map((message, index) => {
            const isValidationTrigger =
              Boolean(validationResponse) &&
              (message.content === VALIDATION_TRIGGER_MESSAGE ||
                message.content.includes('[TRIGGER_VALIDATION]') ||
                index === (reportAnchorIndex ?? data.conversation_history.length) - 2);

            return (
              <Fragment key={index}>
                {message.role === 'user' ? (
                  <Fragment>
                    <ChatBubble align="right" avatarLabel="U">
                      <MarkdownRenderer content={displayMessageContent(message.content)} />
                    </ChatBubble>
                    {isValidationTrigger && validationResponse ? (
                      <div className="py-2 pl-12">
                        <WebSearchDrawer
                          runId={validationResponse.run_id}
                          ideaTitle={data.idea.idea_title ?? data.name}
                          result={validationResponse.result}
                          isLive={false}
                          defaultExpanded={true}
                        />
                      </div>
                    ) : null}
                  </Fragment>
                ) : (
                  <ChatBubble align="left" avatarLabel="AI">
                    {typeOnAssistantMessages.has(index) ? (
                      <TypeOnMarkdown
                        content={message.content}
                        onComplete={() =>
                          setTypingCompletedMessages((prev) => new Set(prev).add(index))
                        }
                      />
                    ) : (
                      <MarkdownRenderer content={message.content} />
                    )}
                  </ChatBubble>
                )}

                {effectiveReportAnchor === index + 1
                  ? !typeOnAssistantMessages.has(index) || typingCompletedMessages.has(index)
                    ? reportNode
                    : null
                  : null}
              </Fragment>
            );
          })}

          {/* Live Validation / Pending Assistant Indicator */}
          {(() => {
            const lastMsg = data.conversation_history[data.conversation_history.length - 1];
            const isLastFromUser = lastMsg?.role === 'user';
            const isValidating =
              (data.state === 'VALIDATING' || isTriggeringValidation) && !data.validation_result;
            const isPendingAssistant =
              chat.isPending || (isLastFromUser && !data.validation_result);

            if (isValidating) {
              return (
                <div className="py-2">
                  <WebSearchDrawer
                    runId={`run-${workspaceId}`}
                    ideaTitle={data.idea.idea_title ?? data.name}
                    result={null}
                    isLive={true}
                    defaultExpanded={true}
                  />
                </div>
              );
            }

            if (isPendingAssistant && !data.validation_result) {
              return (
                <div className="py-2">
                  <ChatBubble align="left" avatarLabel="AI">
                    <TypingIndicator />
                  </ChatBubble>
                </div>
              );
            }

            return null;
          })()}

          {validationResponse &&
          effectiveReportAnchor > data.conversation_history.length &&
          (!typeOnAssistantMessages.has(data.conversation_history.length - 1) ||
            typingCompletedMessages.has(data.conversation_history.length - 1))
            ? reportNode
            : null}

          <div ref={bottomRef} />
        </div>

        {showQuickActions ? (
          <div className="flex shrink-0 flex-wrap gap-2 pb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={chat.isPending}
              onClick={() => send(VALIDATION_TRIGGER_MESSAGE)}
            >
              Run the Validations
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={chat.isPending}
              onClick={() => send(VERIFY_DETAILS_MESSAGE)}
            >
              Verify the details
            </Button>
          </div>
        ) : null}

        {chat.error ? <ApiErrorMessage error={chat.error} className="mb-3 shrink-0" /> : null}

        <div className="w-full shrink-0 pt-2">
          <ChatInput
            value={draft}
            onChange={setDraft}
            onSubmit={() => send(draft)}
            disabled={chat.isPending}
            placeholder="Type your answer here…."
            attachments={attachments}
            onAttach={handleAttach}
            onRemoveAttachment={handleRemoveAttachment}
          />
        </div>
      </div>

      <div className="hidden h-full w-72 shrink-0 overflow-hidden lg:block">
        <AgentStepProgress
          currentStep={currentStep}
          isRunning={data.state === 'VALIDATING'}
          className="h-full"
        />
      </div>
    </div>
  );
}
