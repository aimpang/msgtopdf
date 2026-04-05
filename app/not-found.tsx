import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page not found · MSG to PDF",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-muted)]">
        <FileQuestion className="h-8 w-8 text-[var(--color-muted-foreground)]" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-lg font-medium">Page not found</p>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-muted-foreground)]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </Link>
        <Link href="/convert">
          <Button>Go to converter</Button>
        </Link>
      </div>
    </div>
  );
}
