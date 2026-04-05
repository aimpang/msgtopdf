import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
        <p className="text-xs text-[var(--color-muted-foreground)]">
          &copy; {new Date().getFullYear()} MSG to PDF. Built for people who
          just want the PDF.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          {[
            { href: "/convert", label: "Converter" },
            { href: "/pricing", label: "Pricing" },
            { href: "/about", label: "About" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
