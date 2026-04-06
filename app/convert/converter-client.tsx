"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  AlertTriangle,
  Lock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadZone } from "@/components/upload-zone";
import {
  FileList,
  type QueuedFile,
  type FileStatus,
} from "@/components/file-list";
import { MAX_FILES, formatBytes } from "@/lib/utils";

interface ConvertOptions {
  includeHeaders: boolean;
  embedAttachments: boolean;
  attachmentsZip: boolean;
}

interface Result {
  name: string;
  size: number;
  url: string;
}

interface Me {
  authenticated: boolean;
  email: string | null;
  plan: "guest" | "free" | "pro" | "pro_annual";
  planName: string;
  maxFileSizeBytes: number;
  usage: {
    used: number;
    limit: number | null;
    remaining: number | null;
    approaching: boolean;
    exceeded: boolean;
  };
}

export function ConverterClient() {
  const [files, setFiles] = React.useState<QueuedFile[]>([]);
  const [options, setOptions] = React.useState<ConvertOptions>({
    includeHeaders: true,
    embedAttachments: true,
    attachmentsZip: false,
  });
  const [isConverting, setIsConverting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<Result | null>(null);
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [me, setMe] = React.useState<Me | null>(null);

  const fetchMe = React.useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.ok) setMe(await res.json());
    } catch {
      // Non-fatal: the server will still enforce limits.
    }
  }, []);

  React.useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const maxFileSize = me?.maxFileSizeBytes ?? 15 * 1024 * 1024;

  const addFiles = (incoming: File[]) => {
    setGlobalError(null);
    setResult(null);
    setFiles((prev) => {
      const next = [...prev];
      for (const f of incoming) {
        if (next.length >= MAX_FILES) break;
        if (f.size > maxFileSize) {
          next.push({
            id: crypto.randomUUID(),
            file: f,
            status: "error",
            error: `Too large (max ${formatBytes(maxFileSize)} on ${me?.planName ?? "your"} plan)`,
          });
          continue;
        }
        if (next.some((x) => x.file.name === f.name && x.file.size === f.size)) {
          continue;
        }
        next.push({ id: crypto.randomUUID(), file: f, status: "queued" });
      }
      return next;
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const setAllStatus = (status: FileStatus) => {
    setFiles((prev) =>
      prev.map((f) => (f.status === "error" ? f : { ...f, status })),
    );
  };

  const resetResult = () => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
  };

  const handleConvert = async () => {
    const valid = files.filter((f) => f.status !== "error");
    if (valid.length === 0) {
      setGlobalError("Please add at least one valid .MSG file.");
      return;
    }

    resetResult();
    setGlobalError(null);
    setIsConverting(true);
    setProgress(8);
    setAllStatus("converting");

    try {
      const formData = new FormData();
      for (const q of valid) formData.append("files", q.file, q.file.name);
      formData.append("options", JSON.stringify(options));

      const ticker = setInterval(() => {
        setProgress((p) => (p < 85 ? p + 3 : p));
      }, 250);

      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      clearInterval(ticker);

      if (!res.ok) {
        // Try to surface the server's friendly error (monthly limit, etc.)
        let message = `Conversion failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("content-disposition") ?? "";
      const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
      const filename =
        match?.[1] ??
        (valid.length === 1
          ? valid[0].file.name.replace(/\.msg$/i, ".pdf")
          : "msg-to-pdf-export.zip");

      const url = URL.createObjectURL(blob);
      setResult({ name: filename, size: blob.size, url });
      setProgress(100);
      setAllStatus("done");
      fetchMe(); // refresh usage after a successful conversion
    } catch (err) {
      console.error(err);
      setGlobalError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "converting"
            ? { ...f, status: "error", error: "Conversion failed" }
            : f,
        ),
      );
    } finally {
      setIsConverting(false);
    }
  };

  const validCount = files.filter((f) => f.status !== "error").length;
  const canConvert = validCount > 0 && !isConverting && !me?.usage.exceeded;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          {/* Plan + usage chip */}
          <PlanChip me={me} />

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Convert .MSG to PDF
            </h1>
            <p className="mt-2 text-[var(--color-muted-foreground)]">
              Drop your Outlook .MSG files below. We&apos;ll turn them into
              clean PDFs you can download.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <UploadZone
              onFilesAdded={addFiles}
              disabled={isConverting || Boolean(me?.usage.exceeded)}
              currentCount={files.length}
            />

            {files.length > 0 && (
              <FileList files={files} onRemove={removeFile} />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
                <CardDescription>
                  Tweak how your PDFs are built.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Checkbox
                    checked={options.includeHeaders}
                    onCheckedChange={(v) =>
                      setOptions((o) => ({ ...o, includeHeaders: v }))
                    }
                    label="Include email headers"
                    description="From, To, Subject, Date at the top of each PDF."
                    disabled={isConverting}
                  />
                  <Checkbox
                    checked={options.embedAttachments}
                    onCheckedChange={(v) =>
                      setOptions((o) => ({ ...o, embedAttachments: v }))
                    }
                    label="Embed attachments inside PDF"
                    description="Images are rendered inline; others are listed."
                    disabled={isConverting}
                  />
                  <Checkbox
                    checked={options.attachmentsZip}
                    onCheckedChange={(v) =>
                      setOptions((o) => ({ ...o, attachmentsZip: v }))
                    }
                    label="Save attachments as separate ZIP"
                    description="Bundles the original attachments alongside the PDF."
                    disabled={isConverting}
                  />
                </div>
              </CardContent>
            </Card>

            {isConverting && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Converting…</span>
                  <span className="text-[var(--color-muted-foreground)]">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {globalError && (
              <div className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 p-4 text-sm text-[var(--color-destructive)]">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{globalError}</span>
                </div>
                {(me?.usage.exceeded ||
                  globalError.toLowerCase().includes("upgrade")) && (
                  <Link
                    href="/pricing"
                    className="shrink-0 whitespace-nowrap text-sm font-medium underline"
                  >
                    See plans →
                  </Link>
                )}
              </div>
            )}

            {result && !isConverting && (
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                      Conversion complete
                    </p>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">
                      {result.name} · {formatBytes(result.size)}
                    </p>
                  </div>
                </div>
                <a
                  href={result.url}
                  download={result.name}
                  className="inline-flex"
                >
                  <Button>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </a>
              </div>
            )}

            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
                <Lock className="h-3.5 w-3.5" />
                Files are processed temporarily and automatically deleted after
                download.
              </p>
              <Button
                size="lg"
                disabled={!canConvert}
                onClick={handleConvert}
                className="sm:w-auto"
              >
                {isConverting ? "Converting…" : "Convert to PDF"}
              </Button>
            </div>
          </div>
        </div>
    </main>
  );
}

function PlanChip({ me }: { me: Me | null }) {
  if (!me) {
    return <div className="mb-6 h-12 animate-pulse rounded-xl bg-[var(--color-muted)]/50" />;
  }

  // Pro — celebratory
  if (me.usage.limit === null) {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
        <Sparkles className="h-4 w-4" />
        {me.planName} · unlimited conversions, up to{" "}
        {Math.round(me.maxFileSizeBytes / (1024 * 1024))} MB per file
      </div>
    );
  }

  // Exceeded — hard block with upgrade CTA
  if (me.usage.exceeded) {
    return (
      <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <p className="font-semibold text-[var(--color-destructive)]">
            Monthly limit reached ({me.usage.used}/{me.usage.limit})
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Upgrade to Pro for unlimited conversions and larger file support.
          </p>
        </div>
        <Link href="/pricing">
          <Button size="sm">
            Upgrade to Pro
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  // Free/guest normal or approaching
  const tone = me.usage.approaching
    ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5"
    : "border-[var(--color-border)] bg-[var(--color-card)]";

  return (
    <div
      className={`mb-6 flex flex-col items-start gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${tone}`}
    >
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
        <span>
          <span className="font-medium">
            {me.usage.used} / {me.usage.limit}
          </span>{" "}
          <span className="text-[var(--color-muted-foreground)]">
            conversions this month · {me.planName}
          </span>
        </span>
      </div>
      <Link
        href="/pricing"
        className="text-xs font-medium text-[var(--color-primary)] hover:underline"
      >
        {me.usage.approaching ? "Upgrade to Pro" : "See Pro plans"} →
      </Link>
    </div>
  );
}
