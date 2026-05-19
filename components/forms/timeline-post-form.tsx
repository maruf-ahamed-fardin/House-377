"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { saveTimelinePostAction } from "@/lib/actions/community";
import { timelinePostFormSchema, type TimelinePostFormInput, type TimelinePostFormValues } from "@/lib/validations/community";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TimelinePostForm({
  initialData,
  redirectPath,
}: {
  initialData?: Partial<TimelinePostFormInput>;
  redirectPath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<TimelinePostFormInput, undefined, TimelinePostFormValues>({
    resolver: zodResolver(timelinePostFormSchema),
    defaultValues: {
      id: initialData?.id,
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
    },
  });

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit timeline post" : "Post to timeline"}</CardTitle>
        <CardDescription>Share a problem, operational issue, or general update with everyone in the mess.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await saveTimelinePostAction(values);

              if (!result.success) {
                toast.error(result.message);
                return;
              }

              toast.success(result.message);
              if (!initialData?.id) {
                form.reset({ title: "", content: "" });
              }
              router.push(redirectPath);
              router.refresh();
            });
          })}
        >
          <Input type="hidden" {...form.register("id")} />
          <div className="space-y-2">
            <Label htmlFor="timeline-title">Title</Label>
            <Input id="timeline-title" placeholder="Short heading" {...form.register("title")} />
            {form.formState.errors.title ? <p className="text-xs text-destructive">{form.formState.errors.title.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline-content">Details</Label>
            <Textarea
              id="timeline-content"
              className="min-h-[180px]"
              placeholder="Describe the problem or update clearly so everyone can see it."
              {...form.register("content")}
            />
            {form.formState.errors.content ? <p className="text-xs text-destructive">{form.formState.errors.content.message}</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : initialData?.id ? "Update post" : "Publish post"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(redirectPath)}>
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
