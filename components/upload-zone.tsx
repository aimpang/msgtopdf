"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { cn, MAX_FILE_SIZE, MAX_FILES, formatBytes } from "@/lib/utils";

export interface UploadZoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
  currentCount: number;
}

export function UploadZone({
  onFilesAdded,
  disabled,
  currentCount,
}: UploadZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const files = Array.from(list).filter((f) =>
      f.name.toLowerCase().endsWith(".msg"),
    );
    onFilesAdded(files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        "border-[var(--color-border)] bg-[var(--color-card)]",
        "hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5",
        isDragging && "border-[var(--color-primary)] bg-[var(--color-primary)]/10",
        disabled && "cursor-not-allowed opacity-60 hover:border-[var(--color-border)] hover:bg-[var(--color-card)]",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".msg,application/vnd.ms-outlook"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          // Allow re-selecting the same file again
          e.target.value = "";
        }}
      />
      <div
        className={cn(
          "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-transform",
          isDragging && "scale-110",
        )}
      >
        <Upload className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">
        {isDragging ? "Drop them here" : "Drop .MSG files or click to browse"}
      </h3>
      <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
        Up to {MAX_FILES} files · max {formatBytes(MAX_FILE_SIZE)} each
      </p>
      {currentCount > 0 && (
        <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
          {currentCount} file{currentCount === 1 ? "" : "s"} selected
        </p>
      )}
    </div>
  );
}
