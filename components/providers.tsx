"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { FirebaseAnalytics } from "@/components/firebase-analytics";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <FirebaseAnalytics />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
