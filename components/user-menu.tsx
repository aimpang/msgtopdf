import Link from "next/link";
import { LayoutDashboard, LogOut, CreditCard, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLimits, type Plan } from "@/lib/plans";

/**
 * Server component — renders either sign-in buttons or a tiny user menu.
 * Keeps the header fast (no client-side auth flicker).
 */
export async function UserMenu() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/pricing"
          className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] sm:inline-flex"
        >
          Pricing
        </Link>
        <Link
          href="/login"
          className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-9 items-center rounded-lg bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  const plan = (profile?.plan as Plan | undefined) ?? "free";
  const planLabel = getLimits(plan).name;

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--color-muted)]">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <UserCircle className="h-5 w-5" />
        </div>
        <div className="hidden flex-col items-start leading-tight sm:flex">
          <span className="max-w-[140px] truncate text-xs font-medium">
            {user.email}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {planLabel}
          </span>
        </div>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-lg">
        <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
          Dashboard
        </MenuLink>
        <MenuLink href="/pricing" icon={<CreditCard className="h-4 w-4" />}>
          Pricing & billing
        </MenuLink>
        <div className="my-1 border-t border-[var(--color-border)]" />
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-destructive)] transition-colors hover:bg-[var(--color-destructive)]/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--color-muted)]"
    >
      {icon}
      {children}
    </Link>
  );
}
