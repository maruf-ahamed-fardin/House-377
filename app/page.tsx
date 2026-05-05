import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRight, BedDouble, BellRing, ChartNoAxesCombined, UtensilsCrossed, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

const featureCards = [
  {
    title: "Mess Operations",
    description: "Track daily meals, bazar spending, deposits, rent, and monthly balances with one clean workflow.",
    icon: UtensilsCrossed,
  },
  {
    title: "Member Lifecycle",
    description: "Manage residents, rooms, joining details, guardian contacts, and activation status from a single admin hub.",
    icon: BedDouble,
  },
  {
    title: "Financial Clarity",
    description: "Automatically calculate meal rate, dues, reimbursements, and member-level monthly statements.",
    icon: Wallet,
  },
  {
    title: "Shared Communication",
    description: "Post notices, keep secure important info, and run an internal group chat without leaving the dashboard.",
    icon: BellRing,
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_40%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.05),transparent_65%)]" />
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-16 px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
              <ChartNoAxesCombined className="size-4 text-amber-600" />
              Built for modern mess and hostel teams
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl dark:text-white">
                MessMate keeps meals, money, and members in one polished workflow.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                A full-stack dashboard for student mess and hostel management with role-based access, monthly reports,
                notices, chat, and accurate financial calculations.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-6">
                <Link href="/login">
                  Open MessMate
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-6">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </div>
          <Card className="border-white/60 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl">Why teams like it</CardTitle>
              <CardDescription>
                Faster monthly closing, fewer spreadsheet mistakes, and a cleaner experience for both admins and members.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {featureCards.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 transition-transform duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-900">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="text-lg font-semibold">{feature.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <section id="features" className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="border-white/60 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/70"
              >
                <CardHeader>
                  <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </section>
      </section>
    </main>
  );
}
