"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/lib/actions/auth";
import { registerSchema, type RegisterValues } from "@/lib/validations/register";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function handleGoogleSignUp() {
    startGoogleTransition(async () => {
      await signIn("google", { callbackUrl: "/dashboard" });
    });
  }

  return (
    <div className="space-y-6">
      {/* Google Sign-Up */}
      <Button
        id="google-signup-btn"
        type="button"
        variant="outline"
        className="w-full gap-3 border-border/60 bg-background/60 font-medium hover:bg-accent/60"
        onClick={handleGoogleSignUp}
        disabled={isGooglePending || isPending}
      >
        {isGooglePending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {isGooglePending ? "Connecting..." : "Continue with Google"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background/0 px-3 text-muted-foreground backdrop-blur-sm">
            or create with email
          </span>
        </div>
      </div>

      {/* Email Registration Form */}
      <form
        id="register-form"
        className="space-y-5"
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            const result = await registerAction(values);

            if (!result.success) {
              toast.error(result.message);
              return;
            }

            toast.success("Account created! Signing you in…");

            // Auto sign-in after registration
            const response = await signIn("credentials", {
              email: values.email,
              password: values.password,
              redirect: false,
            });

            if (response?.error) {
              toast.error("Account created but sign-in failed. Please go to login.");
              return;
            }

            window.location.href = "/dashboard";
          });
        })}
      >
        <div className="space-y-2">
          <Label htmlFor="reg-name">Full name</Label>
          <Input
            id="reg-name"
            type="text"
            placeholder="Your full name"
            autoComplete="name"
            {...form.register("name")}
          />
          {form.formState.errors.name ? (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-email">Email</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <Input
            id="reg-password"
            type="password"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-confirm-password">Confirm password</Label>
          <Input
            id="reg-confirm-password"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <Button type="submit" id="register-submit-btn" className="w-full" disabled={isPending || isGooglePending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          id="go-to-login-link"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
