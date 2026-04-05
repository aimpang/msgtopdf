"use client";

import * as React from "react";
import { FileText, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

export type FileStatus = "queued" | "converting" | "done" | "error";

export interface QueuedFile {
  id: string;
  file: File;
  status: FileStatus;
  error?: string;
}

export function FileList({
  files,
  onRemove,
}: {
  files: QueuedFile[];
  onRemove: (id: string) => void;
}) {
  if (files.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2">
      {files.map((f) => (
        <li
          key={f.id}
          className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3"
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              f.status === "error"
                ? "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]"
                : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
            )}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{f.file.name}</span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {formatBytes(f.file.size)}
              {f.error && (
                <>
                  {" · "}
                  <span className="text-[var(--color-destructive)]">
                    {f.error}
                  </span>
                </>
              )}
            </span>
          </div>
          <StatusBadge status={f.status} />
          <button
            type="button"
            onClick={() => onRemove(f.id)}
            aria-label={`Remove ${f.file.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: FileStatus }) {
  switch (status) {
    case "converting":
      return (
        <span className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
          <Loader2 className="h-3 w-3 animate-spin" />
          Converting
        </span>
      );
    case "done":
      return (
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Done
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1.5 rounded-full bg-[var(--color-destructive)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-destructive)]">
          <AlertCircle className="h-3 w-3" />
          Error
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-[var(--color-muted)] px-2.5 py-1 text-xs font-medium text-[var(--color-muted-foreground)]">
          Ready
        </span>
      );
  }
}
