import Link from "next/link";
import { CalendarDays, Pencil, Trash2, UserRoundSearch } from "lucide-react";

import { BazarScheduleForm } from "@/components/forms/bazar-schedule-form";
import { BazarScheduleRequestActions } from "@/components/forms/bazar-schedule-request-actions";
import { DeleteButton } from "@/components/forms/delete-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteBazarScheduleAction } from "@/lib/actions/community";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatMonthLabel, getMonthKey } from "@/lib/month";
import { getBazarSchedulePageData } from "@/lib/queries/app-data";
import { requireAdmin } from "@/lib/rbac";
import { createQueryString, getSingleSearchParam } from "@/lib/utils";

export default async function AdminBazarSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[]; edit?: string | string[] }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const monthKey = getSingleSearchParam(params.month) ?? getMonthKey();
  const editId = getSingleSearchParam(params.edit);
  const data = await getBazarSchedulePageData(admin.id, admin.role, monthKey);
  const editingSchedule = data.schedules.find((schedule) => schedule.id === editId);
  const pendingRequests = data.requests.filter((request) => request.status === "PENDING");
  const redirectPath = `/admin/bazar-schedule${createQueryString({ month: monthKey })}`;

  const initialData = editingSchedule
    ? {
        id: editingSchedule.id,
        memberId: editingSchedule.memberId,
        date: editingSchedule.date.toISOString().slice(0, 10),
        notes: editingSchedule.notes ?? "",
      }
    : undefined;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Bazar Schedule"
        description={`Assign who will handle bazar on which day for ${formatMonthLabel(monthKey)} and review change requests from members.`}
        action={
          <form className="flex flex-wrap items-center gap-3" method="GET">
            <Input className="w-full sm:w-[180px]" type="month" name="month" defaultValue={monthKey} />
            <Button type="submit" variant="outline">
              Apply month
            </Button>
          </form>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Assigned days" value={String(data.schedules.length)} description="Total bazar duty slots assigned for this month." icon={CalendarDays} />
        <StatCard title="Pending requests" value={String(pendingRequests.length)} description="Member requests waiting for admin review." icon={UserRoundSearch} />
        <StatCard title="Processed requests" value={String(data.requests.length - pendingRequests.length)} description="Approved or rejected schedule change requests." icon={CalendarDays} />
        <StatCard title="Unique members" value={String(new Set(data.schedules.map((schedule) => schedule.memberId)).size)} description="Members currently appearing in the monthly bazar schedule." icon={UserRoundSearch} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <BazarScheduleForm members={data.options} initialData={initialData} redirectPath={redirectPath} />

        <div className="space-y-6">
          <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
            <CardHeader>
              <CardTitle>Schedule list</CardTitle>
              <CardDescription>Admin-managed monthly assignment list.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {data.schedules.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>{formatDate(schedule.date)}</TableCell>
                        <TableCell className="font-medium">{schedule.member.user.name}</TableCell>
                        <TableCell>{schedule.member.roomNumber}</TableCell>
                        <TableCell>{schedule.notes ?? "None"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={createQueryString({ month: monthKey, edit: schedule.id })}>
                                <Pencil className="size-4" />
                                Edit
                              </Link>
                            </Button>
                            <DeleteButton label="Delete" message="Delete this bazar schedule?" variant="ghost" action={deleteBazarScheduleAction.bind(null, schedule.id)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                  <Trash2 className="mx-auto mb-4 size-10" />
                  No bazar duty assigned for this month yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
            <CardHeader>
              <CardTitle>Change requests</CardTitle>
              <CardDescription>Approve or reject member requests to move their assigned bazar date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.requests.length ? (
                data.requests.map((request) => (
                  <div key={request.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {request.schedule.member.user.name} requested {formatDate(request.requestedDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Current duty: {formatDate(request.schedule.date)} | Requested by {request.requester.name}
                        </p>
                      </div>
                      <span className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium">{request.status}</span>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{request.reason}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Created {formatDateTime(request.createdAt)}
                      {request.handledBy ? ` | handled by ${request.handledBy.name}` : ""}
                    </p>
                    {request.status === "PENDING" ? <div className="mt-4"><BazarScheduleRequestActions requestId={request.id} /></div> : null}
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                  No schedule change requests for this month.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
