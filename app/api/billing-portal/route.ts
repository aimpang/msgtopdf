import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe, APP_URL } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Opens the Stripe-hosted billing portal so the user can update payment
 * details, switch plans, or cancel. We reuse the stripe_customer_id that
 * /api/checkout stored on their profile.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "You don't have a billing profile yet. Upgrade to Pro first." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${APP_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
