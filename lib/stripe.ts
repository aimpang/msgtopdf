import Stripe from "stripe";

/**
 * Server-only Stripe client. Throws loudly if misconfigured so we never
 * accidentally hit Stripe from a build step or with the wrong key.
 */
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local — see .env.example.",
    );
  }
  cached = new Stripe(key, {
    // Pin an API version so Stripe's silent rollouts don't break prod.
    apiVersion: "2025-02-24.acacia",
    typescript: true,
    appInfo: { name: "MSG to PDF", version: "0.1.0" },
  });
  return cached;
}

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
