"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { communityApi } from "@/lib/api-client";
import {
  bazarScheduleRequestFormSchema,
  type BazarScheduleRequestFormInput,
  type BazarScheduleRequestFormValues,
} from "@/lib/validations/community";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BazarScheduleRequestForm({
  scheduleId,
  currentDate,
  redirectPath,
}: {
  scheduleId: string;
  currentDate: string;
  redirectPath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<BazarScheduleRequestFormInput, undefined, BazarScheduleRequestFormValues>({
    resolver: zodResolver(bazarScheduleRequestFormSchema),
    defaultValues: {
      scheduleId,
      requestedDate: currentDate,
      reason: "",
    },
  });

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader>
        <CardTitle>Request date change</CardTitle>
        <CardDescription>Send the admin a request if you need your bazar duty date changed.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await communityApi.submitChangeRequest(values);

              if (!result.success) {
                toast.error(result.message);
                return;
              }

              toast.success(result.message);
              form.reset({ scheduleId, requestedDate: currentDate, reason: "" });
              router.push(redirectPath);
              router.refresh();
            });
          })}
        >
          <Input type="hidden" {...form.register("scheduleId")} />
          <div className="space-y-2">
            <Label htmlFor="requested-date">Requested date</Label>
            <Input id="requested-date" type="date" {...form.register("requestedDate")} />
            {form.formState.errors.requestedDate ? <p className="text-xs text-destructive">{form.formState.errors.requestedDate.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-reason">Reason</Label>
            <Textarea id="request-reason" placeholder="Why do you need to change this duty date?" {...form.register("reason")} />
            {form.formState.errors.reason ? <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p> : null}
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending..." : "Send request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
