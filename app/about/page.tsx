import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "About · MSG to PDF",
  description:
    "Why we built MSG to PDF — a fast, private, browser-based Outlook .MSG converter with no watermarks.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            About MSG to PDF
          </h1>

          <div className="mt-8 space-y-4 text-[var(--color-muted-foreground)] leading-relaxed">
            <p>
              We built MSG to PDF because opening a .MSG file shouldn&rsquo;t
              require a $150 Outlook license. Lawyers, accountants, freelancers,
              IT teams &mdash; they all get email archives they can&rsquo;t
              read. Existing tools were either bloated desktop apps, sketchy
              upload-your-email sites, or converters that slap a watermark on
              every page.
            </p>
            <p>
              MSG to PDF is the opposite. It runs entirely in your browser. Files
              are processed temporarily and deleted the moment your PDF is ready.
              Every tier &mdash; including the free plan &mdash; produces
              full-quality, watermark-free PDFs with headers, inline images, and
              attachments preserved.
            </p>
            <p>
              No Outlook. No installs. No accounts required. Just drop your .MSG
              files and get clean PDFs in seconds.
            </p>
          </div>

          <div className="mt-10">
            <Link href="/convert">
              <Button size="lg">
                Try the converter
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
