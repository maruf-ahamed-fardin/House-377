"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api-client";
import { registerSchema, type RegisterValues } from "../../shared/validations/register";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const { login } = useAuth();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div className="space-y-6">
      {/* Email Registration Form */}
      <form
        id="register-form"
        className="space-y-5"
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            const result = await authApi.register(values);

            if (!result.success) {
              toast.error(result.message);
              return;
            }

            toast.success("Account created! Signing you in…");

            // Auto sign-in after registration
            const loginResult = await login(values.email, values.password);

            if (!loginResult.success) {
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

        <Button type="submit" id="register-submit-btn" className="w-full" disabled={isPending}>
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
