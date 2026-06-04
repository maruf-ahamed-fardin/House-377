"use client";

import { useMemo } from "react";
import Image from "next/image";
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
    <header className="sticky top-0 z-20 mb-5 rounded-2xl border border-white/60 bg-white/75 px-3 py-3 shadow-lg shadow-slate-900/5 backdrop-blur sm:mb-8 sm:rounded-[2rem] sm:px-4 sm:py-4 xl:px-6 dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <MobileSidebar user={user} />
          <Image
            src="/icons/messmate-mark.png"
            alt=""
            width={72}
            height={72}
            className="size-9 shrink-0 object-contain drop-shadow md:hidden"
          />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold sm:text-lg">{currentPage.title}</p>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">{currentPage.subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
