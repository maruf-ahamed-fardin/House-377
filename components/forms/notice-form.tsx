"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { noticesApi } from "@/lib/api-client";
import { noticeFormSchema, type NoticeFormInput, type NoticeFormValues } from "@/lib/validations/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function NoticeForm({
  initialData,
  redirectPath,
}: {
  initialData?: Partial<NoticeFormValues>;
  redirectPath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<NoticeFormInput, undefined, NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      id: initialData?.id,
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      priority: initialData?.priority ?? "NORMAL",
      date: initialData?.date ?? new Date().toISOString().slice(0, 10),
      isPublished: initialData?.isPublished ?? true,
    },
  });

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit notice" : "Publish notice"}</CardTitle>
        <CardDescription>Post updates with priority flags so members can see what matters most.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await noticesApi.save(values);

              if (!result.success) {
                toast.error(result.message);
                return;
              }

              toast.success(result.message);
              router.push(redirectPath);
              router.refresh();
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="notice-title">Title</Label>
            <Input id="notice-title" {...form.register("title")} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="notice-date">Date</Label>
              <Input id="notice-date" type="date" {...form.register("date")} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="IMPORTANT">Important</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notice-description">Description</Label>
            <Textarea id="notice-description" className="min-h-[180px]" {...form.register("description")} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">Visible to members</p>
              <p className="text-xs text-muted-foreground">Turn this off to save a draft without publishing it.</p>
            </div>
            <Controller
              control={form.control}
              name="isPublished"
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save notice"}
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
