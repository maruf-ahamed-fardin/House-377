"use client";

import { useSyncExternalStore } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const isDark = isMounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      disabled={!isMounted}
      aria-label="Toggle theme"
    >
      {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
    </Button>
  );
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const activeTheme = isMounted ? resolvedTheme : undefined;

  return (
    <div
      className={cn(
        "inline-flex h-10 items-center rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/8",
        className,
      )}
      aria-label="Theme preference"
    >
      {[
        { value: "light", label: "Light", icon: SunMedium },
        { value: "dark", label: "Dark", icon: MoonStar },
      ].map((theme) => {
        const Icon = theme.icon;
        const isActive = activeTheme === theme.value;

        return (
          <button
            key={theme.value}
            type="button"
            onClick={() => setTheme(theme.value)}
            disabled={!isMounted}
            aria-pressed={isActive}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center gap-2 rounded-full px-2 text-xs font-semibold text-slate-500 transition disabled:pointer-events-none disabled:opacity-60 sm:px-3",
              "hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
              isActive &&
                "bg-slate-950 text-white shadow-sm ring-1 ring-slate-950/10 hover:bg-slate-950 hover:text-white dark:bg-white dark:text-slate-950 dark:ring-white/20 dark:hover:bg-white dark:hover:text-slate-950",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{theme.label}</span>
          </button>
        );
      })}
    </div>
  );
}
