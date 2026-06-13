import Link from "next/link";
import { Clock3, MessageSquareText, Pencil, ShieldCheck, Trash2 } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { TimelinePostForm } from "@/components/forms/timeline-post-form";
import { TimelineResolveButton } from "@/components/forms/timeline-resolve-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { communityApi } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";


import { createQueryString, getSingleSearchParam } from "@/lib/utils";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const editId = getSingleSearchParam(params.edit);
  const posts = await getTimelinePageData();
  const editablePost = posts.find((post) => post.id === editId && (user.role === "ADMIN" || post.authorId === user.id));
  const unresolvedCount = posts.filter((post) => !post.isResolved).length;

  const initialData = editablePost
    ? {
        id: editablePost.id,
        title: editablePost.title ?? "",
        content: editablePost.content,
      }
    : undefined;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Timeline"
        description="A shared problem board where everyone can post issues, updates, and operational concerns for the whole mess."
        action={
          editablePost ? (
            <Button asChild variant="outline">
              <Link href="/timeline">Create new post</Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total posts" value={String(posts.length)} description="All timeline posts from admins and members." icon={MessageSquareText} />
        <StatCard title="Open issues" value={String(unresolvedCount)} description="Posts not marked resolved yet." icon={Clock3} />
        <StatCard title="Resolved" value={String(posts.length - unresolvedCount)} description="Posts that admin marked as resolved." icon={ShieldCheck} />
        <StatCard title="My posts" value={String(posts.filter((post) => post.authorId === user.id).length)} description="Posts created from your account." icon={MessageSquareText} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <TimelinePostForm initialData={initialData} redirectPath="/timeline" />

        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Shared timeline</CardTitle>
            <CardDescription>Everyone can read posts here. Admin can mark issues as resolved.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {posts.length ? (
              posts.map((post) => {
                const canManage = user.role === "ADMIN" || post.authorId === user.id;

                return (
                  <div key={post.id} className="rounded-3xl border border-border/70 bg-background/70 p-5">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{post.title ?? "Untitled issue"}</p>
                        <p className="text-sm text-muted-foreground">
                          {post.author.name} | {formatDateTime(post.createdAt)}
                        </p>
                      </div>
                      <Badge variant={post.isResolved ? "secondary" : "default"}>{post.isResolved ? "Resolved" : "Open"}</Badge>
                    </div>

                    <p className="text-sm leading-7 text-muted-foreground">{post.content}</p>

                    {canManage ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={createQueryString({ edit: post.id })}>
                            <Pencil className="size-4" />
                            Edit
                          </Link>
                        </Button>
                        <DeleteButton label="Delete" message="Delete this timeline post?" variant="ghost" action={communityApi.deleteTimelinePost.bind(null, post.id)} />
                        {user.role === "ADMIN" ? <TimelineResolveButton postId={post.id} isResolved={post.isResolved} /> : null}
                      </div>
                    ) : user.role === "ADMIN" ? (
                      <div className="mt-4">
                        <TimelineResolveButton postId={post.id} isResolved={post.isResolved} />
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                <Trash2 className="mx-auto mb-4 size-10" />
                No timeline posts yet. Use the form to post the first issue or update.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
