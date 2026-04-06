import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Upload, Download, Lock } from "lucide-react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUserContext, getUsageSummary } from "@/lib/usage";
import { getLimits, isPaidPlan } from "@/lib/plans";
import { formatBytes } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { UsageMeter } from "@/components/usage-meter";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { TrialBanner } from "@/components/trial-banner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard · MSG to PDF",
  description:
    "View your conversion history, usage, and plan details.",
  alternates: { canonical: "/dashboard" },
};

interface ConversionRow {
  id: string;
  source_filename: string;
  output_filename: string;
  pdf_size_bytes: number | null;
  file_size_bytes: number;
  status: string;
  storage_path: string | null;
  created_at: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const ctx = await getUserContext();
  const usage = await getUsageSummary(ctx);
  const limits = getLimits(ctx.plan);

  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("subscription_status, current_period_end")
    .eq("id", user.id)
    .single();

  const { data: history } = await admin
    .from("conversions")
    .select(
      "id, source_filename, output_filename, pdf_size_bytes, file_size_bytes, status, storage_path, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (history ?? []) as ConversionRow[];
  const canDownloadHistory = isPaidPlan(ctx.plan);
  const isTrialing = profile?.subscription_status === "trialing";
  const trialEndsAt = isTrialing ? profile?.current_period_end : null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          {/* Greeting */}
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your dashboard
              </h1>
              <p className="mt-1 text-[var(--color-muted-foreground)]">
                {user.email} · {limits.name} plan
              </p>
            </div>
            <Link href="/convert">
              <Button size="lg">
                <Upload className="h-5 w-5" />
                New conversion
              </Button>
            </Link>
          </div>

          {isTrialing && trialEndsAt && (
            <TrialBanner trialEndsAt={trialEndsAt} className="mb-6" />
          )}
          <UpgradeBanner usage={usage} className="mb-6" />

          {/* Stats */}
          <div className="grid gap-5 sm:grid-cols-2">
            <UsageMeter usage={usage} />
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Max file size
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {Math.round(limits.maxFileSizeBytes / (1024 * 1024))} MB
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {isPaidPlan(ctx.plan)
                  ? "Pro plan · 50 MB per file"
                  : "Free plan · upgrade for 50 MB files"}
              </p>
            </div>
          </div>

          {/* History */}
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Recent conversions
              </h2>
              {!canDownloadHistory && rows.length > 0 && (
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Unlock downloads →
                </Link>
              )}
            </div>

            {rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-10 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">No conversions yet</p>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  Your history will appear here after your first conversion.
                </p>
                <Link href="/convert" className="mt-4 inline-flex">
                  <Button>Convert your first file</Button>
                </Link>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {rows.map((row) => (
                  <HistoryItem
                    key={row.id}
                    row={row}
                    canDownload={canDownloadHistory}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function HistoryItem({
  row,
  canDownload,
}: {
  row: ConversionRow;
  canDownload: boolean;
}) {
  const date = new Date(row.created_at).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const size = row.pdf_size_bytes ?? row.file_size_bytes;
  const isFailed = row.status === "failed";
  const hasBlob = Boolean(row.storage_path);

  return (
    <li className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          isFailed
            ? "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]"
            : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
        }`}
      >
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">
          {row.source_filename}
        </span>
        <span className="text-xs text-[var(--color-muted-foreground)]">
          {date} · {formatBytes(size ?? 0)}
          {isFailed ? " · failed" : ""}
        </span>
      </div>
      {isFailed ? null : canDownload && hasBlob ? (
        <a
          href={`/api/history/${row.id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 text-xs font-medium hover:bg-[var(--color-muted)]"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
      ) : (
        <span
          title="Upgrade to Pro to re-download past conversions"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-muted-foreground)]"
        >
          <Lock className="h-3.5 w-3.5" />
          Pro
        </span>
      )}
    </li>
  );
}
