"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Checkbox({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
}: CheckboxProps) {
  const reactId = React.useId();
  const checkboxId = id ?? reactId;

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3 transition-colors",
        "hover:bg-[var(--color-muted)]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        id={checkboxId}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
            : "border-[var(--color-border)] bg-transparent",
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>
      <div className="flex flex-col">
        <span className="text-sm font-medium leading-tight">{label}</span>
        {description && (
          <span className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
            {description}
          </span>
        )}
      </div>
    </label>
  );
}
