import { MessageSquareText } from "lucide-react";

import { ChatPanel } from "@/components/chat/chat-panel";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { getChatMessages } from "@/lib/queries/app-data";
import { requireUser } from "@/lib/rbac";

export default async function ChatPage() {
  await requireUser();
  const messages = await getChatMessages(80);

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Mess Chat"
        description="Lightweight group messaging for everyday coordination, reminders, and shared updates."
      />
      {messages.length ? (
        <ChatPanel initialMessages={messages} />
      ) : (
        <EmptyState
          icon={MessageSquareText}
          title="No chat messages yet"
          description="The first message sent here will appear for every logged-in member and admin."
        />
      )}
    </div>
  );
}
