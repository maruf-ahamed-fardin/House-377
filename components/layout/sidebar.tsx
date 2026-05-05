"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { House, ShieldEllipsis } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navigationItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

function LogoMark() {
  return (
    <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950">
      <House className="size-5" />
    </div>
  );
}

export function Sidebar({ user, mobile = false }: { user: Session["user"]; mobile?: boolean }) {
  const pathname = usePathname();
  const items = navigationItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside
      className={cn(
        "glass-card w-72 shrink-0 rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-2xl shadow-slate-900/8 dark:border-white/10 dark:bg-slate-950/60",
        mobile ? "flex" : "hidden md:flex",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-6 flex items-center gap-3 px-2 pt-2">
          <LogoMark />
          <div>
            <p className="text-lg font-semibold tracking-tight">MessMate</p>
            <p className="text-sm text-muted-foreground">Hostel management OS</p>
          </div>
        </div>

        <div className="mb-5 rounded-3xl border border-border/60 bg-background/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldEllipsis className="size-5" />
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Badge className="mt-4 w-fit" variant="secondary">
            {user.role === "ADMIN" ? "Admin access" : "Member access"}
          </Badge>
        </div>

        <ScrollArea className="min-h-0 flex-1 pr-1">
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all",
                    active
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-accent hover:text-foreground dark:text-slate-300",
                  )}
                >
                  <Icon className="size-4.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}
