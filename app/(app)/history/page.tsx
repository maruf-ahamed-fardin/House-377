import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatDateTime } from "@/lib/format";
import { getHistoryPageData } from "@/lib/queries/app-data";
import { requireUser } from "@/lib/rbac";

export default async function HistoryPage() {
  const user = await requireUser();
  const logs = await getHistoryPageData(user.id, user.role);

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Audit History"
        description={
          user.role === "ADMIN"
            ? "Lifetime activity log across members, meals, expenses, notices, payments, and system actions."
            : "Your recent tracked actions inside MessMate."
        }
      />

      <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
        <CardHeader>
          <CardTitle>Activity timeline</CardTitle>
          <CardDescription>
            {user.role === "ADMIN"
              ? "Use this to verify who changed what and when."
              : "Actions recorded under your account appear here."}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Performed by</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action.replaceAll("_", " ")}</TableCell>
                  <TableCell>{log.entityType}</TableCell>
                  <TableCell>{log.performedBy?.name ?? "System"}</TableCell>
                  <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                  <TableCell className="max-w-[320px]">
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-background/70 p-3 text-xs text-muted-foreground">
                      {log.metadata ? JSON.stringify(log.metadata, null, 2) : "No metadata"}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
