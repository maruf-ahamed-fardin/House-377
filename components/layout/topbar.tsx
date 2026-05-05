"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";
import { navigationItems } from "@/lib/constants";

function titleize(value: string) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function Topbar({ user }: { user: Session["user"] }) {
  const pathname = usePathname();

  const currentPage = useMemo(() => {
    const matched = navigationItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

    if (matched) {
      return {
        title: matched.label,
        subtitle: user.role === "ADMIN" ? "Keep your mess operations up to date." : "Your latest mess summary is here.",
      };
    }

    const fallback = pathname.split("/").filter(Boolean).pop() ?? "dashboard";

    return {
      title: titleize(fallback),
      subtitle: "Stay on top of daily mess operations.",
    };
  }, [pathname, user.role]);

  return (
    <header className="sticky top-0 z-20 mb-8 rounded-[2rem] border border-white/60 bg-white/75 px-4 py-4 shadow-lg shadow-slate-900/5 backdrop-blur xl:px-6 dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileSidebar user={user} />
          <div>
            <p className="text-lg font-semibold">{currentPage.title}</p>
            <p className="text-sm text-muted-foreground">{currentPage.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
