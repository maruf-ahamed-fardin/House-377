"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldEllipsis, User } from "lucide-react";

import type { AuthUser } from "../../shared/types";
import { useAuth } from "@/lib/auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navigationItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

function LogoMark() {
  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/30 to-sky-400/20 blur-sm" />
      <Image
        src="/icons/messmate-mark.png"
        alt=""
        width={96}
        height={96}
        className="relative size-10 object-contain drop-shadow-lg"
      />
    </div>
  );
}

interface SidebarContentProps {
  user: AuthUser;
  onNavigate?: () => void;
}

export function SidebarContent({ user, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const items = navigationItems.filter((item) => item.roles.includes(user.role));
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Logo */}
      <div className="mb-5 flex min-w-0 items-center gap-3 px-2 pt-2">
        <LogoMark />
        <div className="min-w-0">
          <p className="text-base font-bold tracking-tight text-foreground">MessMate</p>
          <p className="truncate text-xs font-medium text-muted-foreground">Hostel management OS</p>
        </div>
      </div>

      {/* User profile card */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-background/90 to-muted/40 p-3 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "relative flex size-10 shrink-0 items-center justify-center rounded-xl",
              isAdmin
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30"
                : "bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/30",
            )}
          >
            {user.image ? (
              <Image src={user.image} alt={user.name ?? ""} fill className="rounded-xl object-cover" />
            ) : (
              <User className="size-4.5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
              isAdmin
                ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                : "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
            )}
          >
            <ShieldEllipsis className="size-3" />
            {isAdmin ? "Admin access" : "Member access"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="min-h-0 flex-1 px-0.5">
        <nav className="space-y-0.5 pb-2">
          {items.map((item, index) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            // Add a subtle section separator before "Timeline" (shared items)
            const prevItem = items[index - 1];
            const isSharedSection =
              item.roles.includes("ADMIN") && item.roles.includes("MEMBER") &&
              prevItem && (prevItem.roles.length === 1);

            return (
              <div key={item.href}>
                {isSharedSection && (
                  <div className="mx-2 my-2 border-t border-border/40" />
                )}
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "text-white shadow-md"
                      : "text-slate-500 hover:bg-accent/60 hover:text-foreground dark:text-slate-400 dark:hover:text-foreground",
                  )}
                >
                  {/* Active background gradient */}
                  {active && (
                    <span
                      className={cn(
                        "absolute inset-0 rounded-xl",
                        isAdmin
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25"
                          : "bg-gradient-to-r from-sky-500 to-blue-500 shadow-sky-500/25",
                      )}
                    />
                  )}

                  {/* Icon */}
                  <span className={cn("relative z-10 flex size-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-110", active && "scale-110")}>
                    <Icon className="size-4" />
                  </span>

                  {/* Label */}
                  <span className="relative z-10 truncate">{item.label}</span>

                  {/* Active dot indicator */}
                  {active && (
                    <span className="relative z-10 ml-auto size-1.5 shrink-0 rounded-full bg-white/70" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Sign out button */}
      <div className="mt-3 border-t border-border/40 pt-3">
        <button
          onClick={() => logout()}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive dark:text-slate-400"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-110">
            <LogOut className="size-4" />
          </span>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ user }: { user: AuthUser }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col md:flex xl:w-72">
      <div className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-4 shadow-2xl shadow-slate-900/8 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
        {/* Top gradient accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-2xl bg-gradient-to-b from-amber-400/8 to-transparent dark:from-amber-400/5" />
        <SidebarContent user={user} />
      </div>
    </aside>
  );
}
