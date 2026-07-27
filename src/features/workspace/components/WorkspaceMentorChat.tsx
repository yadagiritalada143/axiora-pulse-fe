import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { OrchestrationRunResponse } from '@/types/orchestration.types';
import { ChatBubble, ChatInput, MarkdownRenderer, TypingIndicator } from '@components/chat';
import { ApiErrorMessage } from '@components/common/ApiErrorMessage';
import { Button } from '@components/ui/button';
import { IdeaValidationReport } from '@features/ideaValidation/components';

import {
  useResetWorkspaceMentor,
  useWorkspaceChat,
  useWorkspaceState,
} from '../hooks/useWorkspaceMentor';

import { WorkspaceMentorIntake } from './WorkspaceMentorIntake';

// The backend mentor only recognizes a fixed set of phrases as the signal to kick off the
// orchestration run (see mentor_service.process_message) - there's no separate "market analysis"
// trigger, so this button sends the phrase it expects. Rendered with a friendlier label below.
const VALIDATION_TRIGGER_MESSAGE = 'Run validation analysis';
const VERIFY_DETAILS_MESSAGE = 'Can you verify and summarize the idea details you have so far?';

function displayMessageContent(content: string): string {
  return content === VALIDATION_TRIGGER_MESSAGE
    ? 'Requested a market analysis validation run.'
    : content;
}

interface WorkspaceMentorChatProps {
  workspaceId: number;
}

export function WorkspaceMentorChat({ workspaceId }: WorkspaceMentorChatProps) {
  const { data, isLoading, isError } = useWorkspaceState(workspaceId);
  const chat = useWorkspaceChat(workspaceId);
  const resetMentor = useResetWorkspaceMentor(workspaceId);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.conversation_history.length, chat.isPending]);

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
    if (!message.trim() || chat.isPending) return;
    chat.mutate(message.trim());
    setDraft('');
  }

  const hasStarted = data.conversation_history.length > 0;

  if (!hasStarted) {
    return <WorkspaceMentorIntake onSubmit={send} isPending={chat.isPending} error={chat.error} />;
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
    <div className="mx-auto flex h-full min-h-[70vh] w-full max-w-4xl flex-col">
      <div className="border-border flex items-center gap-6 border-b text-sm">
        <span className="text-primary border-primary -mb-px border-b-2 pb-2 font-medium">Arya</span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto py-4">
        {data.conversation_history.map((message, index) =>
          message.role === 'user' ? (
            <ChatBubble key={index} align="right" avatarLabel="U">
              <p className="text-sm whitespace-pre-wrap">
                {displayMessageContent(message.content)}
              </p>
            </ChatBubble>
          ) : (
            <ChatBubble key={index} align="left" avatarLabel="AI">
              <MarkdownRenderer content={message.content} />
            </ChatBubble>
          ),
        )}

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
            Start validation
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
      />
    </div>
  );
}
