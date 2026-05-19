import Link from "next/link";
import { WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-white/70 bg-white/85 text-center dark:border-white/10 dark:bg-slate-950/80">
        <CardHeader className="items-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <WifiOff className="size-6" />
          </div>
          <CardTitle>You are offline</CardTitle>
          <CardDescription>
            MessMate needs a connection for the latest meals, payments, notices, and chat updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/">Try again</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
