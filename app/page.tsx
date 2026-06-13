import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  BadgeCheck,
  BedDouble,
  BellRing,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { ThemeSwitcher } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

const metrics = [
  { label: "Meals logged", value: "1,248", trend: "+18%" },
  { label: "Monthly dues", value: "$3.8k", trend: "96%" },
  { label: "Active members", value: "42", trend: "+6" },
];

const featureCards = [
  {
    title: "Mess Operations",
    description: "Meals, bazar spending, deposits, rent, and monthly balances move through one clean workflow.",
    icon: UtensilsCrossed,
    tone: "bg-amber-500/12 text-amber-700 dark:text-amber-200",
  },
  {
    title: "Member Lifecycle",
    description: "Manage rooms, joining details, guardian contacts, and activation status from a single admin hub.",
    icon: BedDouble,
    tone: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-200",
  },
  {
    title: "Financial Clarity",
    description: "Calculate meal rate, dues, reimbursements, and monthly statements without spreadsheet drift.",
    icon: WalletCards,
    tone: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-200",
  },
  {
    title: "Shared Communication",
    description: "Post notices, save important info, and run internal chat without leaving the dashboard.",
    icon: BellRing,
    tone: "bg-rose-500/12 text-rose-700 dark:text-rose-200",
  },
];

const workflow = [
  {
    title: "Collect",
    description: "Meals, bazar, rent, and deposits are entered daily.",
    label: "Daily input",
    icon: ClipboardList,
  },
  {
    title: "Review",
    description: "Admins see exceptions, pending dues, and member status.",
    label: "Risk check",
    icon: ShieldCheck,
  },
  {
    title: "Close",
    description: "Monthly reports and member balances are ready in minutes.",
    label: "Report ready",
    icon: ReceiptText,
  },
];

const activityRows = [
  { member: "Rafi Ahmed", room: "B-204", status: "Meal updated", amount: "$42.80" },
  { member: "Nadia Islam", room: "A-118", status: "Deposit cleared", amount: "$120.00" },
  { member: "Tanvir Hasan", room: "C-012", status: "Rent pending", amount: "$86.40" },
];

const teamViews = [
  { title: "Admin desk", value: "12 tasks", icon: Building2, tone: "text-cyan-700 dark:text-cyan-200" },
  { title: "Member app", value: "42 active", icon: UsersRound, tone: "text-emerald-700 dark:text-emerald-200" },
  { title: "Audit trail", value: "Synced", icon: BadgeCheck, tone: "text-amber-700 dark:text-amber-200" },
];

export default function Home() {

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#f5f7fb] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(15,23,42,0.05)_0%,transparent_34%),radial-gradient(circle_at_18%_12%,rgba(20,184,166,0.16),transparent_32%),radial-gradient(circle_at_84%_8%,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_88%_78%,rgba(14,165,233,0.14),transparent_30%)] dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.74),rgba(15,23,42,0.96)),radial-gradient(circle_at_18%_12%,rgba(20,184,166,0.18),transparent_34%),radial-gradient(circle_at_84%_8%,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_88%_78%,rgba(14,165,233,0.16),transparent_30%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]" />

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#f5f7fb]/82 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/82">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="MessMate home">
            <Image
              src="/icons/messmate-mark.png"
              alt=""
              width={80}
              height={80}
              priority
              className="size-10 object-contain drop-shadow-lg md:size-11"
            />
            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight">MessMate</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hostel CRM</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-slate-950 dark:hover:text-white">
              Features
            </a>
            <a href="#workflow" className="transition hover:text-slate-950 dark:hover:text-white">
              Workflow
            </a>
            <a href="#dashboard" className="transition hover:text-slate-950 dark:hover:text-white">
              Dashboard
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeSwitcher />
            <Button asChild size="sm" className="size-10 shrink-0 rounded-full p-0 md:h-9 md:w-auto md:px-4">
              <Link href="/login" aria-label="Login">
                <span className="hidden md:inline">Login</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 pb-14 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
        <div className="min-w-0 space-y-8">
          <Image
            src="/icons/messmate-logo.png"
            alt="MessMate"
            width={245}
            height={140}
            priority
            className="h-24 w-auto object-contain drop-shadow-xl sm:h-28"
          />

          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-sm font-semibold text-amber-950 shadow-sm shadow-amber-900/5 backdrop-blur dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-50">
            <Sparkles className="size-4 text-amber-600 dark:text-amber-300" />
            Built for modern mess and hostel teams
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-tight text-slate-950 md:text-5xl lg:text-6xl dark:text-white">
              Turn mess management into a clean CRM workspace.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg md:leading-8 dark:text-slate-300">
              MessMate brings members, meals, rent, deposits, reports, notices, and chat into one polished operating
              system for student hostels.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <Link href="/login">
                Open MessMate
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-cyan-200 bg-cyan-50 px-6 text-cyan-950 shadow-sm shadow-cyan-900/5 hover:bg-cyan-100 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-50 dark:hover:bg-cyan-300/15"
            >
              <a href="#features">Explore Features</a>
            </Button>
          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>{metric.label}</span>
                  <span className="rounded-full bg-emerald-500/12 px-2 py-1 text-emerald-700 dark:text-emerald-300">
                    {metric.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section id="dashboard" aria-label="MessMate dashboard preview" className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-slate-950/10 blur-3xl dark:bg-cyan-500/10" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-2xl shadow-slate-900/15 backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-rose-400" />
                <span className="size-3 rounded-full bg-amber-400" />
                <span className="size-3 rounded-full bg-emerald-400" />
              </div>
              <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-white/6 dark:text-slate-300 sm:block">
                May 2026 Operations
              </div>
            </div>

            <div className="grid min-h-[560px] bg-slate-50/70 dark:bg-slate-950/40 lg:grid-cols-[176px_1fr]">
              <aside className="hidden border-r border-slate-200/80 bg-white p-4 text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-white lg:block">
                <div className="mb-8 flex items-center gap-3">
                  <Image src="/icons/messmate-mark.png" alt="" width={72} height={72} className="size-10 object-contain drop-shadow" />
                  <div>
                    <p className="text-sm font-semibold">MessMate</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Admin suite</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {["Overview", "Members", "Meals", "Finance", "Chat"].map((item, index) => (
                    <div
                      key={item}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                        index === 0
                          ? "bg-cyan-50 text-cyan-950 ring-1 ring-cyan-100 dark:bg-white dark:text-slate-950 dark:ring-0"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <span className={`size-2 rounded-full ${index === 0 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                      {item}
                    </div>
                  ))}
                </div>
              </aside>

              <div className="min-w-0 p-4 sm:p-5">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Workspace</p>
                    <h2 className="text-2xl font-semibold tracking-tight">Campus Nest Hostel</h2>
                  </div>
                  <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm shadow-emerald-900/5 dark:border-white/15 dark:bg-white dark:text-slate-950">
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/15">
                      <LockKeyhole className="size-3.5" />
                    </span>
                    Admin access
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Meal Rate", value: "$2.84", icon: LineChart },
                    { label: "Collected", value: "$2,930", icon: CircleDollarSign },
                    { label: "Open Tasks", value: "18", icon: CalendarClock },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-950 dark:bg-white dark:text-slate-950">
                          <Icon className="size-4" />
                        </div>
                        <p className="text-xl font-semibold">{item.value}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-white/5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">Member activity</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Live CRM-style resident ledger</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Synced
                      </span>
                    </div>
                    <div className="space-y-3">
                      {activityRows.map((row) => (
                        <div
                          key={row.member}
                          className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-slate-950/50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{row.member}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{row.room} - {row.status}</p>
                          </div>
                          <p className="text-sm font-semibold">{row.amount}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-amber-50 p-4 text-slate-950 shadow-sm shadow-slate-900/10 dark:border-white/10 dark:bg-none dark:bg-slate-950 dark:text-white">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Monthly close</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Finance health</p>
                      </div>
                      <CheckCircle2 className="size-5 text-emerald-500 dark:text-emerald-300" />
                    </div>
                    <div className="flex h-36 items-end gap-2">
                      {[42, 66, 54, 78, 60, 88, 74, 95].map((height, index) => (
                        <div
                          key={height + index}
                          className="flex-1 rounded-t-xl bg-gradient-to-t from-cyan-500 to-amber-300"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-5 rounded-2xl bg-white/80 p-3 text-sm text-slate-600 shadow-sm shadow-slate-900/5 dark:bg-white/10 dark:text-slate-300">
                      94% dues collected before monthly report generation.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
              CRM for mess teams
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              One workspace for the full resident journey.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            The dashboard behaves like a real operations CRM: every member has context, every transaction has a trail,
            and monthly close stays predictable.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm shadow-slate-900/5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 dark:border-white/10 dark:bg-white/5"
              >
                <div className={`mb-5 flex size-12 items-center justify-center rounded-2xl ${feature.tone}`}>
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="workflow" className="border-y border-slate-200/80 bg-white py-14 text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-white sm:py-18">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8">
          <div className="space-y-6">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-950 shadow-sm shadow-cyan-900/5 dark:bg-white dark:text-slate-950">
              <LayoutDashboard className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
                Closing pipeline
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Review the whole month from one operational timeline.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Every meal, payment, rent item, and member update lands in a structured flow before final statements go
                out.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:max-w-xl">
              {["Role-ready views", "Auto balance logic", "Chat and notices"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/8"
                >
                  <CheckCircle2 className="mb-3 size-4 text-emerald-600 dark:text-emerald-300" />
                  <p className="text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-cyan-200 sm:block dark:bg-cyan-300/25" />
            <div className="space-y-4">
              {workflow.map((step, index) => {
                const Icon = step.icon;

                return (
                  <article
                    key={step.title}
                    className="relative grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/8 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:p-5"
                  >
                    <div className="z-10 flex size-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm shadow-slate-900/5 dark:shadow-none">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-200">0{index + 1}</span>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
                    </div>
                    <div className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-100">
                      {step.label}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f7fb] py-16 dark:bg-slate-950 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
                Team command room
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                A calmer view for admins, residents, and monthly finance.
              </h2>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-100">
              <Activity className="size-4" />
              Live operations snapshot
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/8 dark:border-white/10 dark:bg-white/5">
              <div className="grid gap-0 md:grid-cols-3">
                {teamViews.map((view) => {
                  const Icon = view.icon;

                  return (
                    <div
                      key={view.title}
                      className="border-b border-slate-200 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 dark:border-white/10"
                    >
                      <div className={`mb-5 flex size-12 items-center justify-center rounded-2xl bg-slate-100 ${view.tone} dark:bg-white/10`}>
                        <Icon className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{view.title}</p>
                      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{view.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 p-5 dark:border-white/10 sm:p-6">
                <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      Everything important stays visible.
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Admins can see who paid, who needs attention, what changed today, and what is ready for report
                      generation.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      ["Rent collection", "86%"],
                      ["Meal audit", "Ready"],
                      ["Notice reach", "41 / 42"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/50"
                      >
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-100 dark:bg-white dark:text-slate-950 dark:ring-0">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-slate-50 p-5 text-slate-950 shadow-xl shadow-slate-900/8 dark:border-white/10 dark:bg-none dark:bg-slate-950 dark:text-white">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">Member pulse</p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-tight">Residents stay informed.</h3>
                  </div>
                  <BellRing className="size-5 text-amber-500 dark:text-amber-300" />
                </div>
                <div className="space-y-3">
                  {["Dinner count updated", "Deposit receipt shared", "Room B notice pinned"].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 dark:border-0 dark:bg-white/10 dark:text-slate-100"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/8 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Finance confidence</p>
                <div className="mt-4 flex items-end gap-3">
                  <p className="text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">94%</p>
                  <p className="pb-1 text-sm font-medium text-slate-500 dark:text-slate-400">dues reconciled</p>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-300" />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  A clear month-end state without hunting through messages or sheets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
