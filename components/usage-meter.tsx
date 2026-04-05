import type { UsageSummary } from "@/lib/usage";
import { Progress } from "@/components/ui/progress";

export function UsageMeter({ usage }: { usage: UsageSummary }) {
  if (usage.limit === null) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          This month
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{usage.used}</p>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          conversions · unlimited on your plan
        </p>
      </div>
    );
  }

  const pct = Math.min(100, (usage.used / usage.limit) * 100);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            This month
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            {usage.used}{" "}
            <span className="text-lg font-normal text-[var(--color-muted-foreground)]">
              / {usage.limit}
            </span>
          </p>
        </div>
        <p className="text-sm font-medium text-[var(--color-muted-foreground)]">
          {usage.remaining} left
        </p>
      </div>
      <Progress value={pct} className="mt-4" />
      <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
        Counter resets on the 1st of each month (UTC).
      </p>
    </div>
  );
}
