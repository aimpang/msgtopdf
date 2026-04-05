import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { PRO_PRICING } from "@/lib/plans";
import { UpgradeButton } from "@/components/upgrade-button";

export const metadata = {
  title: "Pricing · MSG to PDF",
  description:
    "Free, Pro, and Pro Annual plans for MSG to PDF. Every tier produces full-quality, watermark-free PDFs.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPlan = user
    ? ((
        await supabase.from("profiles").select("plan").eq("id", user.id).single()
      ).data?.plan as "free" | "pro" | "pro_annual" | undefined) ?? "free"
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1 text-xs font-medium text-[var(--color-muted-foreground)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              Fair, transparent pricing
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Pick the plan that fits you
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--color-muted-foreground)]">
              Every tier produces full-quality, watermark-free PDFs. Upgrade
              only when you need more.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Free */}
            <PlanCard
              title="Free"
              price="$0"
              cadence="forever"
              description="For the occasional email-to-PDF."
              highlights={[
                "8 conversions per month",
                "15 MB per file",
                "Full-quality, watermark-free PDFs",
                "Headers, inline images, attachments",
              ]}
              footnote="Counter resets on the 1st of each month (UTC)."
              cta={
                currentPlan === "free" ? (
                  <DisabledCta label="Your current plan" />
                ) : user ? (
                  <Link href="/convert" className="inline-flex w-full">
                    <SecondaryCta label="Go to converter" />
                  </Link>
                ) : (
                  <Link href="/signup" className="inline-flex w-full">
                    <SecondaryCta label="Create free account" />
                  </Link>
                )
              }
            />

            {/* Pro */}
            <PlanCard
              title="Pro"
              price={`$${PRO_PRICING.monthlyUsd}`}
              cadence="per month"
              description="For people who convert emails every week."
              highlighted
              badge="Most popular"
              highlights={[
                "Unlimited conversions",
                "50 MB per file",
                "Full conversion history with downloads",
                "Priority support",
              ]}
              cta={
                currentPlan === "pro" ? (
                  <DisabledCta label="Your current plan" />
                ) : (
                  <UpgradeButton
                    plan="monthly"
                    loggedIn={Boolean(user)}
                    label="Upgrade to Pro"
                  />
                )
              }
            />

            {/* Pro Annual */}
            <PlanCard
              title="Pro Annual"
              price={`$${PRO_PRICING.annualUsd}`}
              cadence="per year"
              description={`Same Pro features, billed yearly — save ${PRO_PRICING.annualSavingsMonthsFree} months.`}
              highlights={[
                `Equivalent to $${PRO_PRICING.annualMonthlyEquivalentUsd.toFixed(2)}/mo`,
                "Unlimited conversions",
                "50 MB per file",
                "Full conversion history with downloads",
              ]}
              cta={
                currentPlan === "pro_annual" ? (
                  <DisabledCta label="Your current plan" />
                ) : (
                  <UpgradeButton
                    plan="annual"
                    loggedIn={Boolean(user)}
                    label="Upgrade to Pro Annual"
                  />
                )
              }
            />
          </div>

          {/* Promises */}
          <div className="mx-auto mt-16 grid max-w-4xl gap-3 text-sm text-[var(--color-muted-foreground)] sm:grid-cols-2">
            <Promise text="No watermarks at any tier, ever." />
            <Promise text="Free users get the same PDF quality as Pro." />
            <Promise text="Cancel anytime from the billing portal." />
            <Promise text="Files are deleted after conversion unless you're on Pro history." />
          </div>
        </div>
      </main>
    </div>
  );
}

function PlanCard({
  title,
  price,
  cadence,
  description,
  highlights,
  cta,
  highlighted,
  badge,
  footnote,
}: {
  title: string;
  price: string;
  cadence: string;
  description: string;
  highlights: string[];
  cta: React.ReactNode;
  highlighted?: boolean;
  badge?: string;
  footnote?: string;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        highlighted
          ? "border-[var(--color-primary)] bg-[var(--color-card)] shadow-lg shadow-[var(--color-primary)]/10"
          : "border-[var(--color-border)] bg-[var(--color-card)]"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-foreground)] shadow">
          {badge}
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">{price}</span>
        <span className="text-sm text-[var(--color-muted-foreground)]">
          / {cadence}
        </span>
      </div>
      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
        {description}
      </p>
      <ul className="mt-6 flex flex-col gap-2.5 text-sm">
        {highlights.map((h) => (
          <li key={h} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">{cta}</div>
      {footnote && (
        <p className="mt-3 text-center text-xs text-[var(--color-muted-foreground)]">
          {footnote}
        </p>
      )}
    </div>
  );
}

function DisabledCta({ label }: { label: string }) {
  return (
    <div className="flex h-11 w-full items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-muted-foreground)]">
      {label}
    </div>
  );
}

function SecondaryCta({ label }: { label: string }) {
  return (
    <div className="flex h-11 w-full items-center justify-center rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-muted)]">
      {label}
    </div>
  );
}

function Promise({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2">
      <Check className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
      <span>{text}</span>
    </div>
  );
}
