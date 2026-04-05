import { NextResponse } from "next/server";
import { getUserContext, getUsageSummary } from "@/lib/usage";
import { getLimits } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the caller's plan + usage so the UI can show a fair, real-time
 * picture of limits. Cheap enough to call from the converter page on
 * mount and after every successful conversion.
 */
export async function GET() {
  const ctx = await getUserContext();
  const usage = await getUsageSummary(ctx);
  const limits = getLimits(ctx.plan);

  return NextResponse.json({
    authenticated: Boolean(ctx.userId),
    email: ctx.email,
    plan: ctx.plan,
    planName: limits.name,
    maxFileSizeBytes: limits.maxFileSizeBytes,
    usage: {
      used: usage.used,
      limit: usage.limit,
      remaining: usage.remaining,
      approaching: usage.approaching,
      exceeded: usage.exceeded,
    },
  });
}
