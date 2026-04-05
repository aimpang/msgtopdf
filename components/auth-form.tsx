"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn, signUp, type AuthFormState } from "@/app/(auth)/actions";

interface AuthFormProps {
  mode: "signin" | "signup";
  next?: string;
}

const initialState: AuthFormState = {};

export function AuthForm({ mode, next = "/dashboard" }: AuthFormProps) {
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction] = useActionState(action, initialState);

  const title = mode === "signin" ? "Welcome back" : "Create your account";
  const subtitle =
    mode === "signin"
      ? "Log in to see your conversion history and usage."
      : "Get 8 free conversions a month, plus history and upgrades.";
  const cta = mode === "signin" ? "Log in" : "Create account";
  const alt =
    mode === "signin" ? (
      <>
        New here?{" "}
        <Link
          href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          Create an account
        </Link>
      </>
    ) : (
      <>
        Already have an account?{" "}
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          Log in
        </Link>
      </>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
          {subtitle}
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <Field
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            {mode === "signin" && (
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={mode === "signup" ? 8 : undefined}
            className="h-10 rounded-lg border border-[var(--color-input)] bg-[var(--color-background)] px-3 text-sm transition-colors focus-visible:border-[var(--color-ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
          {mode === "signup" && (
            <span className="text-xs text-[var(--color-muted-foreground)]">
              At least 8 characters.
            </span>
          )}
        </div>

        {state.error && (
          <div className="flex items-start gap-2 rounded-lg border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}
        {state.success && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.success}</span>
          </div>
        )}

        <SubmitButton label={cta} />
      </form>

      <div className="flex flex-col gap-3">
        <div className="relative flex items-center">
          <div className="flex-1 border-t border-[var(--color-border)]" />
          <span className="px-3 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            or
          </span>
          <div className="flex-1 border-t border-[var(--color-border)]" />
        </div>
        <Link href="/convert" className="inline-flex">
          <Button variant="outline" className="w-full">
            Continue as guest
          </Button>
        </Link>
        <p className="text-center text-xs text-[var(--color-muted-foreground)]">
          Guest mode: 3 conversions per session, no history.
        </p>
      </div>

      <p className="text-center text-sm text-[var(--color-muted-foreground)]">
        {alt}
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className="h-10 rounded-lg border border-[var(--color-input)] bg-[var(--color-background)] px-3 text-sm transition-colors focus-visible:border-[var(--color-ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
      />
      {hint && (
        <span className="text-xs text-[var(--color-muted-foreground)]">
          {hint}
        </span>
      )}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Please wait…
        </>
      ) : (
        label
      )}
    </Button>
  );
}
