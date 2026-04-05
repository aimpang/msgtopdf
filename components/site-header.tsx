import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <Logo />
          <span className="text-base font-bold tracking-tight sm:text-lg">
            MSG<span className="text-[var(--color-muted-foreground)] font-medium"> to </span>PDF
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/convert"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] sm:inline-flex"
          >
            Converter
          </Link>
          <Link
            href="/pricing"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] sm:inline-flex"
          >
            Pricing
          </Link>
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 shadow-sm ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md">
      {/* Subtle sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/25" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="relative h-[18px] w-[18px] text-white"
        strokeWidth="2.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Document outline with folded corner */}
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        {/* Body lines */}
        <path d="M9 13h6" opacity="0.9" />
        <path d="M9 17h4" opacity="0.9" />
      </svg>
    </div>
  );
}
