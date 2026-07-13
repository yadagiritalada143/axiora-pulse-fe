import type { ID, Timestamps } from '@/types/common.types';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageAttachment {
  id: ID;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ChatMessage extends Timestamps {
  id: ID;
  conversationId: ID;
  role: MessageRole;
  content: string;
  attachments: MessageAttachment[];
  /** True while an assistant message is still receiving stream chunks. */
  isStreaming?: boolean;
}

export interface Conversation extends Timestamps {
  id: ID;
  title: string;
  modelId: string;
  lastMessagePreview: string | null;
}

/** A saved, reusable prompt starting point (future: user- or org-authored). */
export interface PromptTemplate {
  id: ID;
  title: string;
  prompt: string;
}

/** Describes one selectable AI backend/model - enables future multi-provider support. */
export interface AIModel {
  id: ID;
  label: string;
  provider: string;
  description: string;
  isDefault: boolean;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  attachmentIds?: string[];
}

export interface StreamChunk {
  conversationId: string;
  messageId: string;
  delta: string;
  done: boolean;
}
