import Link from "next/link";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/format";

export function MonthlyReportTable({
  monthKey,
  rows,
}: {
  monthKey: string;
  rows: Array<{
    memberId: string;
    name: string;
    roomNumber: string;
    mealTotal: number;
    mealCost: number;
    rentAmount: number;
    otherExpenseShare: number;
    payable: number;
    amountPaid: number;
    bazarContribution: number;
    finalBalance: number;
  }>;
}) {
  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Member-wise monthly settlement</CardTitle>
          <CardDescription>Positive balance means the member should get money back. Negative means the member still owes.</CardDescription>
        </div>
        <Button asChild variant="outline">
          <Link href={`/api/reports/monthly?month=${monthKey}`}>
            <Download className="size-4" />
            Export CSV
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Total Meals</TableHead>
              <TableHead>Meal Cost</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Other Share</TableHead>
              <TableHead>Total Payable</TableHead>
              <TableHead>Paid / Deposited</TableHead>
              <TableHead>Bazar Contribution</TableHead>
              <TableHead>Final Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.memberId}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.roomNumber}</TableCell>
                <TableCell>{formatNumber(row.mealTotal)}</TableCell>
                <TableCell>{formatCurrency(row.mealCost)}</TableCell>
                <TableCell>{formatCurrency(row.rentAmount)}</TableCell>
                <TableCell>{formatCurrency(row.otherExpenseShare)}</TableCell>
                <TableCell>{formatCurrency(row.payable)}</TableCell>
                <TableCell>{formatCurrency(row.amountPaid)}</TableCell>
                <TableCell>{formatCurrency(row.bazarContribution)}</TableCell>
                <TableCell>
                  <Badge variant={row.finalBalance >= 0 ? "default" : "destructive"}>{formatCurrency(row.finalBalance)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
