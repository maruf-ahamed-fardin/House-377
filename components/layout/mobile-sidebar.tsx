"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { Menu, X } from "lucide-react";

import { SidebarContent } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";

export function MobileSidebar({ user }: { user: Session["user"] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    // Delay so the open-click itself doesn't immediately close
    const timer = setTimeout(() => document.addEventListener("mousedown", handle), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handle);
    };
  }, [open]);

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <Button
        variant="outline"
        size="icon"
        id="mobile-menu-btn"
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="shrink-0 border-border/60 bg-background/70 backdrop-blur md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-4" />
      </Button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={[
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* Slide-in drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col md:hidden",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Drawer card */}
        <div className="relative m-3 flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-4 shadow-2xl shadow-slate-900/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
          {/* Top gradient accent */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-2xl bg-gradient-to-b from-amber-400/10 to-transparent dark:from-amber-400/6" />

          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          <SidebarContent user={user} onNavigate={() => setOpen(false)} />
        </div>
      </div>
    </>
  );
}
