import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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
import { IdeaValidationReport } from '@features/ideaValidation/components';

import { workspaceService } from '../api';
import {
  useResetWorkspaceMentor,
  useWorkspaceChat,
  useWorkspaceState,
} from '../hooks/useWorkspaceMentor';
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

interface WorkspaceMentorChatProps {
  workspaceId: number;
}

export function WorkspaceMentorChat({ workspaceId }: WorkspaceMentorChatProps) {
  const { data, isLoading, isError } = useWorkspaceState(workspaceId);
  const chat = useWorkspaceChat(workspaceId);
  const resetMentor = useResetWorkspaceMentor(workspaceId);
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [typeOnAssistantMessages, setTypeOnAssistantMessages] = useState<Set<number>>(
    () => new Set(),
  );
  const bottomRef = useRef<HTMLDivElement>(null);

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
      } catch {
        toast.error(`Failed to upload ${file.name}. Please try again.`);
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
    chat.mutate({
      message: finalMessage,
      attachments: payloadAttachments.length > 0 ? payloadAttachments : null,
    });
    setDraft('');
    setAttachments([]);
  }

  const currentStep = getStepFromWorkspaceState(data.state);
  const hasStarted = data.conversation_history.length > 0;

  if (!hasStarted) {
    return (
      <div className="mx-auto flex h-full min-h-[70vh] w-full max-w-6xl items-start gap-6">
        <div className="min-w-0 flex-1">
          <AgentStepProgress currentStep={1} className="mb-4 block lg:hidden" />
          <WorkspaceMentorIntake onSubmit={send} isPending={chat.isPending} error={chat.error} />
        </div>
        <div className="hidden w-72 shrink-0 lg:block">
          <AgentStepProgress currentStep={1} />
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

  return (
    <div className="mx-auto flex h-full min-h-[70vh] w-full max-w-6xl items-start gap-6">
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <AgentStepProgress
          currentStep={currentStep}
          isRunning={data.state === 'VALIDATING'}
          className="mb-4 block lg:hidden"
        />

        <div className="border-border flex items-center gap-6 border-b text-sm">
          <span className="text-primary border-primary -mb-px border-b-2 pb-2 font-medium">
            Arya
          </span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {data.conversation_history.map((message, index) => {
            if (message.role === 'user') {
              return (
                <ChatBubble key={index} align="right" avatarLabel="U">
                  <MarkdownRenderer content={displayMessageContent(message.content)} />
                </ChatBubble>
              );
            }

            return (
              <ChatBubble key={index} align="left" avatarLabel="AI">
                {typeOnAssistantMessages.has(index) ? (
                  <TypeOnMarkdown content={message.content} />
                ) : (
                  <MarkdownRenderer content={message.content} />
                )}
              </ChatBubble>
            );
          })}

          {chat.isPending ? (
            <ChatBubble align="left" avatarLabel="AI">
              <TypingIndicator />
            </ChatBubble>
          ) : null}

          {validationResponse ? (
            <IdeaValidationReport
              workspaceId={workspaceId}
              ideaTitle={data.idea.idea_title ?? data.name}
              response={validationResponse}
              onRetake={() => resetMentor.mutate()}
            />
          ) : null}

          <div ref={bottomRef} />
        </div>

        {showQuickActions ? (
          <div className="flex flex-wrap gap-2 pb-3">
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

        {chat.error ? <ApiErrorMessage error={chat.error} className="mb-3" /> : null}

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

      <div className="hidden w-72 shrink-0 lg:block">
        <AgentStepProgress currentStep={currentStep} isRunning={data.state === 'VALIDATING'} />
      </div>
    </div>
  );
}
