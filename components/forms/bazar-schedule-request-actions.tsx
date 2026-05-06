"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { handleBazarScheduleChangeRequestAction } from "@/lib/actions/community";
import { Button } from "@/components/ui/button";

export function BazarScheduleRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function submit(status: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      const result = await handleBazarScheduleChangeRequestAction({
        requestId,
        status,
        adminNote: "",
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" disabled={isPending} onClick={() => submit("APPROVED")}>
        Approve
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => submit("REJECTED")}>
        Reject
      </Button>
    </div>
  );
}
