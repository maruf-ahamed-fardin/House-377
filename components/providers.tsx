"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { PwaRegister } from "@/components/pwa-register";
import { AuthProvider } from "@/lib/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <PwaRegister />
        <FirebaseAnalytics />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </AuthProvider>
  );
}
