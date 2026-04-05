import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { priceIdToPlan, type Plan } from "@/lib/plans";

export const runtime = "nodejs";
// Stripe signs raw bodies — Next must not parse them.
export const dynamic = "force-dynamic";

/**
 * Stripe webhook. Events we care about:
 *   • checkout.session.completed       → attach subscription to profile
 *   • customer.subscription.created    → sync plan
 *   • customer.subscription.updated    → sync plan + period end + status
 *   • customer.subscription.deleted    → revert to free
 *   • invoice.payment_failed           → mark past_due
 *
 * The middleware matcher excludes this route so Supabase session cookies
 * are never touched on incoming Stripe requests.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("[stripe] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const userId = session.client_reference_id;
        if (!userId || !subscriptionId || !customerId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscription(admin, sub, userId, customerId);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        // Look up our user by customer id — subscriptions can be updated
        // without going through checkout (e.g. from the billing portal).
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        if (!profile) break;

        if (event.type === "customer.subscription.deleted") {
          await admin
            .from("profiles")
            .update({
              plan: "free" as Plan,
              subscription_status: sub.status,
              stripe_subscription_id: null,
              current_period_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);
        } else {
          await syncSubscription(admin, sub, profile.id, customerId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;
        if (!customerId) break;
        await admin
          .from("profiles")
          .update({
            subscription_status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      default:
        // Not interested.
        break;
    }
  } catch (err) {
    console.error(`[stripe] handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(
  admin: ReturnType<typeof createServiceClient>,
  sub: Stripe.Subscription,
  userId: string,
  customerId: string,
) {
  const priceId = sub.items.data[0]?.price.id;
  const plan = priceIdToPlan(priceId) ?? "free";

  await admin
    .from("profiles")
    .update({
      plan,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}
