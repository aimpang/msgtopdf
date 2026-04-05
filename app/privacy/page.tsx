import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Privacy Policy · MSG to PDF",
  description:
    "How MSG to PDF handles your data, files, and privacy. GDPR and CCPA compliant.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="prose-custom mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Effective date: April 1, 2026
          </p>

          <div className="mt-10 space-y-10 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Who we are
              </h2>
              <p className="mt-3">
                MSG to PDF (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;)
                operates the website at{" "}
                <strong className="text-[var(--color-foreground)]">msgtopdf.tools</strong>.
                This policy explains what data we collect, how we use it, and
                what rights you have.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                What we collect
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-[var(--color-foreground)]">Uploaded files.</strong>{" "}
                  When you convert a .MSG file, the file is uploaded to our
                  servers for processing. We do not read, index, or store the
                  contents of your emails beyond what is needed to produce the
                  PDF.
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Account information.</strong>{" "}
                  If you create an account, we store your email address and a
                  hashed password. We never store passwords in plain text.
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Usage data.</strong>{" "}
                  We track basic analytics such as page views, conversion
                  counts, and error rates to improve the service. This data is
                  aggregated and not tied to your email content.
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Payment information.</strong>{" "}
                  Credit card details are collected and processed entirely by
                  Stripe. We never see or store your full card number.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                How we handle your files
              </h2>
              <p className="mt-3">
                Files you upload are processed temporarily on our servers. Once
                your PDF is generated and downloaded, the original .MSG file and
                the resulting PDF are automatically deleted. We do not retain
                copies of your files after conversion is complete.
              </p>
              <p className="mt-2">
                If you are on a Pro plan with conversion history enabled, PDFs
                are stored in encrypted cloud storage so you can re-download
                them. You can delete any stored file at any time from your
                dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Cookies and analytics
              </h2>
              <p className="mt-3">
                We use essential cookies to manage your session and
                authentication. We may use privacy-focused analytics to
                understand how visitors use the site. We do not use advertising
                trackers or sell your data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Third-party services
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-[var(--color-foreground)]">Stripe</strong>{" "}
                  processes payments. Their privacy policy is available at{" "}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] underline"
                  >
                    stripe.com/privacy
                  </a>
                  .
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Cloudflare</strong>{" "}
                  provides CDN and security services. Their privacy policy is
                  at{" "}
                  <a
                    href="https://www.cloudflare.com/privacypolicy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] underline"
                  >
                    cloudflare.com/privacypolicy
                  </a>
                  .
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Supabase</strong>{" "}
                  provides authentication and database hosting. Their privacy
                  policy is at{" "}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] underline"
                  >
                    supabase.com/privacy
                  </a>
                  .
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Your rights under GDPR
              </h2>
              <p className="mt-3">
                If you are located in the European Economic Area, you have the
                right to:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Request a portable copy of your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, email us at{" "}
                <a
                  href="mailto:privacy@msgtopdf.tools"
                  className="text-[var(--color-primary)] underline"
                >
                  privacy@msgtopdf.tools
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Your rights under CCPA
              </h2>
              <p className="mt-3">
                If you are a California resident, you have the right to:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Know what personal information we collect and how it is used
                </li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of the sale of your personal information</li>
                <li>
                  Not be discriminated against for exercising your privacy
                  rights
                </li>
              </ul>
              <p className="mt-2">
                We do not sell your personal information. To make a request,
                email{" "}
                <a
                  href="mailto:privacy@msgtopdf.tools"
                  className="text-[var(--color-primary)] underline"
                >
                  privacy@msgtopdf.tools
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Data retention
              </h2>
              <p className="mt-3">
                Uploaded files are deleted immediately after conversion (or
                after download for Pro history users). Account data is retained
                while your account is active. If you delete your account, all
                associated data is removed within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Changes to this policy
              </h2>
              <p className="mt-3">
                We may update this policy from time to time. If we make
                material changes, we will notify you by email or by posting a
                notice on the site. Continued use of the service after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Governing law
              </h2>
              <p className="mt-3">
                This policy is governed by the laws of the State of Delaware,
                United States, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Contact
              </h2>
              <p className="mt-3">
                For privacy-related questions or requests, email{" "}
                <a
                  href="mailto:privacy@msgtopdf.tools"
                  className="text-[var(--color-primary)] underline"
                >
                  privacy@msgtopdf.tools
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
