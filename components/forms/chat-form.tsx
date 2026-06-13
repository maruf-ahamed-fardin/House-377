"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizonal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { chatApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatMessageSchema, type ChatMessageValues } from "@/lib/validations/chat";

export function ChatForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ChatMessageValues>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await chatApi.send(values);

          if (!result.success) {
            toast.error(result.message);
            return;
          }

          form.reset();
          router.refresh();
        });
      })}
    >
      <Textarea className="min-h-[120px]" placeholder="Write something for the group..." {...form.register("content")} />
      {form.formState.errors.content ? <p className="text-xs text-destructive">{form.formState.errors.content.message}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Send message"}
          {!isPending ? <SendHorizonal className="size-4" /> : null}
        </Button>
      </div>
    </form>
  );
}
