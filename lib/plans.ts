/**
 * Plan tiers and the fair-use limits that go with them.
 *
 * Rules (per product spec):
 *   • No watermarks at any tier — Free and Pro produce identical PDFs.
 *   • Free:  8 conversions / calendar month,  15 MB per file
 *   • Pro:   unlimited,                       50 MB per file
 *   • Guest: 3 per browser session,           15 MB per file
 *            (encourages signup without slamming the door on trial users)
 */

export type Plan = "guest" | "free" | "pro" | "pro_annual";

export interface PlanLimits {
  name: string;
  maxFileSizeBytes: number;
  /** null = unlimited */
  monthlyConversions: number | null;
  hasHistoryDownloads: boolean;
}

const MB = 1024 * 1024;

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  guest: {
    name: "Guest",
    maxFileSizeBytes: 15 * MB,
    monthlyConversions: 3,
    hasHistoryDownloads: false,
  },
  free: {
    name: "Free",
    maxFileSizeBytes: 15 * MB,
    monthlyConversions: 8,
    hasHistoryDownloads: false,
  },
  pro: {
    name: "Pro",
    maxFileSizeBytes: 50 * MB,
    monthlyConversions: null,
    hasHistoryDownloads: true,
  },
  pro_annual: {
    name: "Pro Annual",
    maxFileSizeBytes: 50 * MB,
    monthlyConversions: null,
    hasHistoryDownloads: true,
  },
};

export const PRO_PRICING = {
  monthlyUsd: 9,
  annualUsd: 89,
  annualMonthlyEquivalentUsd: 7.42, // 89 / 12
  annualSavingsMonthsFree: 2,
} as const;

export function getLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function isPaidPlan(plan: Plan): boolean {
  return plan === "pro" || plan === "pro_annual";
}

/**
 * Map a Stripe price ID back to a plan. Used by the webhook to sync
 * profile.plan when a subscription is created/updated.
 */
export function priceIdToPlan(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY) return "pro";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL) return "pro_annual";
  return null;
}
