import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Terms of Service · MSG to PDF",
  description:
    "Terms of Service for MSG to PDF. Acceptable use, file limits, liability, and governing law.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="prose-custom mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Effective date: April 1, 2026
          </p>

          <div className="mt-10 space-y-10 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Agreement to terms
              </h2>
              <p className="mt-3">
                By accessing or using MSG to PDF at{" "}
                <strong className="text-[var(--color-foreground)]">msgtopdf.tools</strong>{" "}
                (&ldquo;the Service&rdquo;), you agree to be bound by these
                Terms of Service (&ldquo;Terms&rdquo;). If you do not agree,
                do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                What the Service does
              </h2>
              <p className="mt-3">
                MSG to PDF converts Microsoft Outlook .MSG files into PDF
                documents. Files are uploaded to our servers, converted, and
                made available for download. The Service is provided on an
                &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Acceptable use
              </h2>
              <p className="mt-3">You agree not to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Upload files that contain illegal content, malware, or
                  material that violates any applicable law
                </li>
                <li>
                  Use the Service to process protected health information (PHI)
                  regulated under HIPAA unless you accept full responsibility
                  for compliance with applicable healthcare privacy laws
                </li>
                <li>
                  Attempt to reverse-engineer, disassemble, or interfere with
                  the operation of the Service
                </li>
                <li>
                  Use automated scripts, bots, or scrapers to access the
                  Service beyond normal browser use
                </li>
                <li>
                  Resell, redistribute, or sublicense the Service without
                  written permission
                </li>
              </ul>
              <p className="mt-3">
                You are solely responsible for the content of files you upload
                and for ensuring you have the right to convert and download
                them.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Plans and limits
              </h2>
              <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--color-border)]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/50">
                      <th className="px-4 py-2 font-medium text-[var(--color-foreground)]">
                        Plan
                      </th>
                      <th className="px-4 py-2 font-medium text-[var(--color-foreground)]">
                        Max file size
                      </th>
                      <th className="px-4 py-2 font-medium text-[var(--color-foreground)]">
                        Conversions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--color-border)]">
                      <td className="px-4 py-2">Guest</td>
                      <td className="px-4 py-2">15 MB</td>
                      <td className="px-4 py-2">3 per session</td>
                    </tr>
                    <tr className="border-b border-[var(--color-border)]">
                      <td className="px-4 py-2">Free</td>
                      <td className="px-4 py-2">15 MB</td>
                      <td className="px-4 py-2">8 per month</td>
                    </tr>
                    <tr className="border-b border-[var(--color-border)]">
                      <td className="px-4 py-2">Pro</td>
                      <td className="px-4 py-2">50 MB</td>
                      <td className="px-4 py-2">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Pro Annual</td>
                      <td className="px-4 py-2">50 MB</td>
                      <td className="px-4 py-2">Unlimited</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                We reserve the right to adjust limits with reasonable notice.
                Abuse of the Service (e.g., automated bulk uploads beyond plan
                limits) may result in throttling or suspension.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Payments and subscriptions
              </h2>
              <p className="mt-3">
                Paid plans are billed in advance on a monthly or annual basis
                through Stripe. You may cancel at any time from the billing
                portal. Cancellation takes effect at the end of the current
                billing period. We do not offer prorated refunds for partial
                billing periods.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Intellectual property
              </h2>
              <p className="mt-3">
                You retain all rights to the files you upload and the PDFs you
                download. We claim no ownership over your content. The MSG to
                PDF name, logo, and website design are our property and may not
                be used without permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                No warranty
              </h2>
              <p className="mt-3">
                The Service is provided &ldquo;as is&rdquo; without warranties
                of any kind, whether express or implied, including but not
                limited to implied warranties of merchantability, fitness for a
                particular purpose, and non-infringement. We do not guarantee
                that the Service will be uninterrupted, error-free, or that
                converted PDFs will be identical in layout to the original
                email.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Limitation of liability
              </h2>
              <p className="mt-3">
                To the maximum extent permitted by law, MSG to PDF and its
                operators shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, or any loss of
                profits or data, arising out of or related to your use of the
                Service. Our total liability for any claim shall not exceed the
                amount you have paid us in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Account termination
              </h2>
              <p className="mt-3">
                You may delete your account at any time. We reserve the right
                to suspend or terminate your account if you violate these
                Terms, abuse the Service, or engage in activity that disrupts
                normal operation. If we terminate your account for cause, you
                will not be entitled to a refund for any prepaid subscription
                fees.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Changes to these terms
              </h2>
              <p className="mt-3">
                We may update these Terms from time to time. Material changes
                will be communicated via email or a notice on the site.
                Continued use of the Service after changes take effect
                constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Governing law
              </h2>
              <p className="mt-3">
                These Terms are governed by the laws of the State of Delaware,
                United States, without regard to conflict of law principles.
                Any disputes shall be resolved in the state or federal courts
                located in Delaware.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Contact
              </h2>
              <p className="mt-3">
                For questions about these Terms, email{" "}
                <a
                  href="mailto:legal@msgtopdf.tools"
                  className="text-[var(--color-primary)] underline"
                >
                  legal@msgtopdf.tools
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
