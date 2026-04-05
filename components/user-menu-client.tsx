"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { LayoutDashboard, LogOut, CreditCard, UserCircle } from "lucide-react";

/**
 * Client component to handle menu closing on navigation.
 */
export function UserMenuClient({
  userEmail,
  planLabel,
}: {
  userEmail: string;
  planLabel: string;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);

  const closeMenu = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  const openBillingPortal = async () => {
    setIsLoadingBilling(true);
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
      setIsLoadingBilling(false);
    }
  };

  return (
    <details ref={detailsRef} className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--color-muted)]">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <UserCircle className="h-5 w-5" />
        </div>
        <div className="hidden flex-col items-start leading-tight sm:flex">
          <span className="max-w-[140px] truncate text-xs font-medium">
            {userEmail}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {planLabel}
          </span>
        </div>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-lg">
        <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={closeMenu}>
          Dashboard
        </MenuLink>
        <button
          onClick={() => {
            closeMenu();
            openBillingPortal();
          }}
          disabled={isLoadingBilling}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--color-muted)] disabled:opacity-50"
        >
          <CreditCard className="h-4 w-4" />
          {isLoadingBilling ? "Loading..." : "Pricing & billing"}
        </button>
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
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--color-muted)]"
    >
      {icon}
      {children}
    </Link>
  );
}
