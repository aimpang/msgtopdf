import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Upload,
  ShieldCheck,
  Zap,
  FileText,
  Lock,
  Mail,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "MSG to PDF — Convert Outlook .MSG Files Instantly",
  description:
    "Convert Outlook .MSG files to clean PDFs in seconds. No Outlook needed, no installs, no accounts. Free online tool.",
  alternates: { canonical: "/" },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MSG to PDF",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any (web-based)",
  description:
    "Convert Outlook .MSG files to clean PDFs in seconds. No Outlook needed, no installs, no accounts.",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier — 8 conversions per month",
    },
    {
      "@type": "Offer",
      price: "9",
      priceCurrency: "USD",
      description: "Pro — unlimited conversions",
    },
  ],
};

const faqItems = [
  {
    question: "How do I open a .MSG file without Outlook?",
    answer:
      "Upload your .MSG file to MSG to PDF and we\u2019ll convert it to a clean, readable PDF in seconds. No Outlook installation or Microsoft account required \u2014 it works entirely in your browser on any device.",
  },
  {
    question: "How do I convert MSG to PDF for free?",
    answer:
      "Just drag and drop your .MSG files onto the converter page. The free tier gives you 8 conversions per month with no account required. Every PDF is full-quality and watermark-free, regardless of plan.",
  },
  {
    question: "What is a .MSG file?",
    answer:
      "A .MSG file is Microsoft Outlook\u2019s proprietary format for storing individual email messages, including the subject, sender, recipients, body text, and attachments. Because it\u2019s an Outlook-specific format, opening it normally requires Outlook or a compatible email client \u2014 or a converter like MSG to PDF.",
  },
  {
    question: "How do I convert MSG to PDF on Mac?",
    answer:
      "Since MSG to PDF runs entirely in the browser, it works on macOS, Windows, Linux, and even mobile devices. Open the converter, drop your .MSG file, and download the PDF. No Outlook for Mac needed.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteHeader />

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Decorative gradient */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-20 flex justify-center"
          >
            <div className="h-[420px] w-[720px] rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 via-fuchsia-500/10 to-transparent blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
            {/* Monetization teaser pill */}
            <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1 text-xs font-medium text-[var(--color-muted-foreground)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              </span>
              Free tier available · Pro from $9/mo
            </div>

            <h1 className="mx-auto max-w-3xl text-center text-4xl font-bold tracking-tight sm:text-6xl">
              Convert Outlook{" "}
              <span className="bg-gradient-to-br from-[var(--color-primary)] to-fuchsia-500 bg-clip-text text-transparent">
                .MSG
              </span>{" "}
              files to PDF instantly
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-[var(--color-muted-foreground)]">
              Open MSG files without Outlook. Works in your browser. Drop your
              files, get clean PDFs in seconds.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/convert">
                <Button size="lg" className="w-full sm:w-auto">
                  <Upload className="h-5 w-5" />
                  Upload .MSG Files
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See pricing
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-center text-xs text-[var(--color-muted-foreground)]">
              Continue as guest · or{" "}
              <Link href="/signup" className="underline hover:text-[var(--color-foreground)]">
                create a free account
              </Link>{" "}
              for 8 conversions a month and history.
            </p>

            {/* Privacy strip */}
            <div className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-xs text-[var(--color-muted-foreground)]">
              <Lock className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
              <span>
                Files are processed temporarily and automatically deleted after
                download.
              </span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Blazing fast"
              description="Convert .MSG files to clean PDFs in seconds — not minutes. No software to install."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Private by default"
              description="Nothing is stored. Your emails exist just long enough to be converted."
            />
            <FeatureCard
              icon={<Mail className="h-5 w-5" />}
              title="Headers & attachments"
              description="Our Outlook MSG converter preserves From, To, Subject, Date and optionally exports attachments alongside."
            />
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              Three steps. No friction.
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <Step
                number={1}
                title="Drop your .MSG files"
                description="Drag & drop, or pick them from your computer."
              />
              <Step
                number={2}
                title="Pick your options"
                description="Include headers, embed images, export attachments."
              />
              <Step
                number={3}
                title="Download clean PDFs"
                description="Single file or a tidy ZIP when converting many."
              />
            </div>
            <div className="mt-10 flex justify-center">
              <Link href="/convert">
                <Button size="lg">
                  <FileText className="h-5 w-5" />
                  Start converting
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-[var(--color-border)]">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
            <div className="mt-10 flex flex-col gap-3">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)] transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-[var(--color-border)] px-6 py-4 text-sm text-[var(--color-muted-foreground)]">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
          <p className="text-xs text-[var(--color-muted-foreground)]">
            © {new Date().getFullYear()} MSG to PDF. Built for people who just
            want the PDF.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {[
              { href: "/pricing", label: "Pricing" },
              { href: "/convert", label: "Converter" },
              { href: "/login", label: "Log in" },
              { href: "/signup", label: "Sign up" },
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
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-primary-foreground)]">
        {number}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
        {description}
      </p>
    </div>
  );
}
