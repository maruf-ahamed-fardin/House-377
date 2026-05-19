"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { PwaRegister } from "@/components/pwa-register";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <PwaRegister />
        <FirebaseAnalytics />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
