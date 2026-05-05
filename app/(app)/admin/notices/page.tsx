import Link from "next/link";
import { Bell, Pencil } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { NoticeForm } from "@/components/forms/notice-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { noticePriorityClasses } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getNoticesPageData } from "@/lib/queries/app-data";
import { requireAdmin } from "@/lib/rbac";
import { createQueryString, getSingleSearchParam } from "@/lib/utils";
import { deleteNoticeAction } from "@/lib/actions/notices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const editId = getSingleSearchParam(params.edit);
  const notices = await getNoticesPageData();
  const editingNotice = notices.find((notice) => notice.id === editId);

  const initialData = editingNotice
    ? {
        id: editingNotice.id,
        title: editingNotice.title,
        description: editingNotice.description,
        priority: editingNotice.priority,
        date: editingNotice.date.toISOString().slice(0, 10),
        isPublished: editingNotice.isPublished,
      }
    : undefined;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Notice Board"
        description="Post, edit, draft, and publish notices with priority markers for all members."
        action={
          editId ? (
            <Button asChild variant="outline">
              <Link href="/admin/notices">Create new notice</Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <NoticeForm initialData={initialData} redirectPath="/admin/notices" />

        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Notice history</CardTitle>
            <CardDescription>Published notices are visible to members. Drafts remain admin-only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notices.length ? (
              notices.map((notice) => (
                <div key={notice.id} className="rounded-3xl border border-border/70 bg-background/70 p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{notice.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(notice.date)} | by {notice.createdBy.name}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={noticePriorityClasses[notice.priority]}>{notice.priority}</Badge>
                      <Badge variant={notice.isPublished ? "default" : "secondary"}>{notice.isPublished ? "Published" : "Draft"}</Badge>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{notice.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={createQueryString({ edit: notice.id })}>
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                    </Button>
                    <DeleteButton label="Delete" message="Delete this notice?" variant="ghost" action={() => deleteNoticeAction(notice.id)} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto mb-4 size-10" />
                No notices have been posted yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
