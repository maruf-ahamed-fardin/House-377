import Link from "next/link";
import { CalendarDays, ClipboardList, RefreshCcw } from "lucide-react";

import { BazarScheduleRequestForm } from "@/components/forms/bazar-schedule-request-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatMonthLabel, getMonthKey } from "@/lib/month";
import { getBazarSchedulePageData } from "@/lib/queries/app-data";
import { requireUser } from "@/lib/rbac";
import { createQueryString, getSingleSearchParam } from "@/lib/utils";

export default async function BazarSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[]; request?: string | string[] }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const monthKey = getSingleSearchParam(params.month) ?? getMonthKey();
  const requestScheduleId = getSingleSearchParam(params.request);
  const data = await getBazarSchedulePageData(user.id, user.role, monthKey);
  const requestableSchedules = data.schedules.filter((schedule) => schedule.member.userId === user.id);
  const selectedSchedule = requestableSchedules.find((schedule) => schedule.id === requestScheduleId) ?? requestableSchedules[0] ?? null;
  const redirectPath = `/bazar-schedule${createQueryString({ month: monthKey, request: selectedSchedule?.id ?? undefined })}`;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Bazar Schedule"
        description={`See who will handle bazar on which day for ${formatMonthLabel(monthKey)} and request a date change if needed.`}
        action={
          <form className="flex items-center gap-3" method="GET">
            <Input className="w-[180px]" type="month" name="month" defaultValue={monthKey} />
            <Button type="submit" variant="outline">
              Apply month
            </Button>
          </form>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Assigned days" value={String(data.schedules.length)} description="Current monthly bazar duty assignments." icon={CalendarDays} />
        <StatCard title="My duty count" value={String(requestableSchedules.length)} description="How many bazar days are currently assigned to you." icon={ClipboardList} />
        <StatCard title="My requests" value={String(data.requests.length)} description="Your submitted schedule change requests." icon={RefreshCcw} />
        <StatCard
          title="Pending requests"
          value={String(data.requests.filter((request) => request.status === "PENDING").length)}
          description="Requests still waiting for an admin decision."
          icon={RefreshCcw}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Monthly bazar duty list</CardTitle>
            <CardDescription>Everyone can see the assignment list. Only your own duty rows can be requested for change.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Request</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.schedules.map((schedule) => {
                  const isOwnSchedule = schedule.member.userId === user.id;

                  return (
                    <TableRow key={schedule.id}>
                      <TableCell>{formatDate(schedule.date)}</TableCell>
                      <TableCell className="font-medium">{schedule.member.user.name}</TableCell>
                      <TableCell>{schedule.member.roomNumber}</TableCell>
                      <TableCell>{schedule.notes ?? "None"}</TableCell>
                      <TableCell>
                        {isOwnSchedule ? (
                          <Button asChild size="sm" variant="outline">
                            <Link href={createQueryString({ month: monthKey, request: schedule.id })}>Request change</Link>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Only assigned member</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedSchedule ? (
            <BazarScheduleRequestForm
              scheduleId={selectedSchedule.id}
              currentDate={selectedSchedule.date.toISOString().slice(0, 10)}
              redirectPath={redirectPath}
            />
          ) : (
            <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
              <CardHeader>
                <CardTitle>No duty assigned yet</CardTitle>
                <CardDescription>When an admin assigns you a bazar date, you will be able to request a change from here.</CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
            <CardHeader>
              <CardTitle>My request history</CardTitle>
              <CardDescription>Your submitted bazar-date change requests and their current status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.requests.length ? (
                data.requests.map((request) => (
                  <div key={request.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {formatDate(request.schedule.date)} to {formatDate(request.requestedDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">{request.schedule.member.user.name}</p>
                      </div>
                      <span className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium">{request.status}</span>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{request.reason}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Created {formatDateTime(request.createdAt)}
                      {request.handledBy ? ` | handled by ${request.handledBy.name}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No request has been submitted yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
