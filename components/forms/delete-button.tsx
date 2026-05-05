"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/helpers";

export function DeleteButton({
  label = "Delete",
  message = "Are you sure you want to delete this item?",
  action,
  variant = "destructive",
}: {
  label?: string;
  message?: string;
  action: () => Promise<ActionResult>;
  variant?: "destructive" | "outline" | "ghost";
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(message)) {
          return;
        }

        startTransition(async () => {
          const result = await action();

          if (result.success) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        });
      }}
    >
      {isPending ? "Working..." : label}
    </Button>
  );
}
