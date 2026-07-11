import { PageHeader } from '@components/common/PageHeader';
import { ChatWindow } from '@features/ai/components/ChatWindow';

export default function AIChatPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="AI Co-Founder"
        description="Chat with your AI co-founder to validate and shape your idea."
      />
      <div className="min-h-0 flex-1">
        <ChatWindow />
      </div>
    </div>
  );
}
