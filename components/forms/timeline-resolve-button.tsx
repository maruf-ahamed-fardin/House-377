"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { communityApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function TimelineResolveButton({
  postId,
  isResolved,
}: {
  postId: string;
  isResolved: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await communityApi.toggleResolved(postId);

          if (!result.success) {
            toast.error(result.message);
            return;
          }

          toast.success(result.message);
          router.refresh();
        });
      }}
    >
      {isPending ? "Working..." : isResolved ? "Reopen" : "Mark resolved"}
    </Button>
  );
}
