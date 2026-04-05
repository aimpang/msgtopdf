import Link from "next/link";
import { Sparkles, Zap, ArrowRight } from "lucide-react";
import type { UsageSummary } from "@/lib/usage";
import { cn } from "@/lib/utils";

interface UpgradeBannerProps {
  usage: UsageSummary;
  className?: string;
}

/**
 * Gentle upgrade prompt. Three visual states:
 *   • idle  — nothing rendered (plenty of room left)
 *   • soft  — "You have X left this month" nudge
 *   • hard  — "Limit reached" red-amber banner
 *   • pro   — celebratory "You're on Pro" chip
 */
export function UpgradeBanner({ usage, className }: UpgradeBannerProps) {
  // Pro users: small success chip, no upsell
  if (usage.limit === null) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300",
          className,
        )}
      >
        <Sparkles className="h-4 w-4" />
        You&apos;re on {usage.plan === "pro_annual" ? "Pro Annual" : "Pro"} —
        unlimited conversions and 50 MB files.
      </div>
    );
  }

  // Hard limit hit
  if (usage.exceeded) {
    return (
      <div
        className={cn(
          "flex flex-col items-start gap-3 rounded-xl border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 p-4 sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-destructive)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-destructive)]">
              You&apos;ve used all {usage.limit} free conversions this month
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Upgrade to Pro for unlimited conversions and 50 MB files.
            </p>
          </div>
        </div>
        <Link href="/pricing">
          <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90">
            Upgrade to Pro
            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    );
  }

  // Soft nudge (≤2 left)
  if (usage.approaching) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary)]/5 to-fuchsia-500/5 px-4 py-3",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm">
            <span className="font-medium">
              {usage.remaining} conversion{usage.remaining === 1 ? "" : "s"}{" "}
              left
            </span>{" "}
            <span className="text-[var(--color-muted-foreground)]">
              this month · Pro is unlimited for $9/mo
            </span>
          </p>
        </div>
        <Link
          href="/pricing"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Upgrade
        </Link>
      </div>
    );
  }

  // Idle
  return null;
}
