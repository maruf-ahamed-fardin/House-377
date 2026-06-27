import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireUser } from "@/lib/rbac";

export default async function AssistantPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="AI Assistant"
        description="Ask about meals, bazar, rent, dues, deposits, notices and more — in Bangla, English, Banglish or Hindi."
      />
      <AssistantPanel userName={user.name} />
    </div>
  );
}
