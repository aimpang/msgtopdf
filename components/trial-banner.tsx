"use client";

import { Zap } from "lucide-react";
import { useState } from "react";

export function TrialBanner({
  trialEndsAt,
  className,
}: {
  trialEndsAt: string;
  className?: string;
}) {
  const [isOpening, setIsOpening] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openBillingPortal = async () => {
    setIsOpening(true);
    try {
      const response = await fetch("/api/billing-portal", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to open billing portal");
      }
    } catch (error) {
      alert("Failed to open billing portal");
      console.error(error);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-700 dark:bg-amber-950 ${className || ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-amber-900 dark:text-amber-100">
            Your free trial ends on <strong>{formatDate(trialEndsAt)}</strong> — you'll be charged
            <strong> $9.99</strong> after that.{" "}
            <button
              onClick={openBillingPortal}
              disabled={isOpening}
              className="font-medium underline hover:no-underline disabled:opacity-50"
            >
              {isOpening ? "Loading..." : "Cancel anytime"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
