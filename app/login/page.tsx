import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck, Sparkles, Users } from "lucide-react";

import { auth } from "@/auth";
import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Role-based access",
    description: "Admins manage finance, meals, and members. Members see only their own mess data.",
    icon: ShieldCheck,
  },
  {
    title: "Monthly clarity",
    description: "Track meals, bazar, rent, deposits, and final balances without spreadsheet drift.",
    icon: Sparkles,
  },
  {
    title: "Shared operations",
    description: "Run notices, important contacts, and group chat from one secure workspace.",
    icon: Users,
  },
];

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.08))] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200">
            <LockKeyhole className="size-4 text-amber-600" />
            Secure mess and hostel operations
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              Sign in to keep MessMate running cleanly every month.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              One place for meals, payments, notices, rent distribution, member management, and group coordination.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;

              return (
                <Card
                  key={highlight.title}
                  className="border-white/60 bg-white/75 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/65"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{highlight.title}</CardTitle>
                    <CardDescription>{highlight.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        <Card className="border-white/70 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl">Welcome back</CardTitle>
            <CardDescription>
              Use your MessMate account to open the dashboard that matches your role and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm />
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
              Seeded credentials and local setup steps are documented in the project README.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
