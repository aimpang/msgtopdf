/**
 * Usage enforcement — the single source of truth for "can this user
 * convert this file right now?".
 *
 * Guest usage is tracked via an HMAC-signed HTTP-only cookie so it survives
 * reloads without being trivially spoofable. The signature uses a server-side
 * secret (COOKIE_SECRET env var; falls back to a hard-coded dev value so local
 * dev works without extra setup — production MUST set the real secret).
 */

import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getLimits, type Plan } from "@/lib/plans";

export interface UserContext {
  userId: string | null;
  email: string | null;
  plan: Plan;
}

export interface UsageSummary {
  plan: Plan;
  used: number;
  limit: number | null; // null = unlimited
  remaining: number | null; // null = unlimited
  approaching: boolean; // true when user has ≤ 2 conversions left on a capped plan
  exceeded: boolean;
}

const GUEST_COOKIE = "guest_usage";
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ─── HMAC signing ──────────────────────────────────────────────────────────

function getCookieSecret(): string {
  return process.env.COOKIE_SECRET ?? "dev-only-change-in-production";
}

async function sign(value: string): Promise<string> {
  const secret = getCookieSecret();
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${value}.${hex}`;
}

async function verify(signed: string): Promise<string | null> {
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return null;
  const value = signed.slice(0, dot);
  const expected = await sign(value);
  // Constant-time comparison to prevent timing attacks.
  if (expected !== signed) return null;
  return value;
}

// ─── User context ──────────────────────────────────────────────────────────

/**
 * Resolve the caller's user context:
 *   • logged-in → reads profiles.plan
 *   • anonymous → returns plan: 'guest'
 */
export async function getUserContext(): Promise<UserContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, email: null, plan: "guest" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan as Plan | undefined) ?? "free";
  return { userId: user.id, email: user.email ?? null, plan };
}

/**
 * Current-month usage for a given user context. For guests we read the
 * session cookie; for logged-in users we count completed conversions
 * since the start of the current UTC month.
 */
export async function getUsageSummary(ctx: UserContext): Promise<UsageSummary> {
  const limits = getLimits(ctx.plan);
  const limit = limits.monthlyConversions;

  let used = 0;
  if (ctx.userId) {
    const admin = createServiceClient();
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const { count } = await admin
      .from("conversions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ctx.userId)
      .eq("status", "completed")
      .gte("created_at", monthStart.toISOString());

    used = count ?? 0;
  } else {
    used = await readGuestUsage();
  }

  const remaining = limit === null ? null : Math.max(0, limit - used);
  const approaching =
    limit !== null && remaining !== null && remaining <= 2 && remaining > 0;
  const exceeded = limit !== null && used >= limit;

  return { plan: ctx.plan, used, limit, remaining, approaching, exceeded };
}

/**
 * Check-then-act: can this caller convert `fileCount` more files, each
 * no larger than `maxFileSize` bytes? Returns a reason string on refusal
 * so the API can surface a friendly upgrade prompt.
 */
export async function checkCanConvert(
  ctx: UserContext,
  files: { size: number }[],
): Promise<{ ok: true } | { ok: false; reason: string; code: "FILE_TOO_LARGE" | "MONTHLY_LIMIT" }> {
  const limits = getLimits(ctx.plan);

  for (const f of files) {
    if (f.size > limits.maxFileSizeBytes) {
      const mb = Math.round(limits.maxFileSizeBytes / (1024 * 1024));
      return {
        ok: false,
        code: "FILE_TOO_LARGE",
        reason: `${limits.name} plan allows files up to ${mb} MB. Upgrade to Pro for 50 MB files.`,
      };
    }
  }

  if (limits.monthlyConversions !== null) {
    const usage = await getUsageSummary(ctx);
    if (usage.used + files.length > limits.monthlyConversions) {
      const leftover = Math.max(0, limits.monthlyConversions - usage.used);
      return {
        ok: false,
        code: "MONTHLY_LIMIT",
        reason:
          leftover === 0
            ? `You've used all ${limits.monthlyConversions} ${limits.name.toLowerCase()} conversions this month. Upgrade to Pro for unlimited conversions.`
            : `This batch would exceed your monthly limit — you have ${leftover} conversion${leftover === 1 ? "" : "s"} left on the ${limits.name} plan.`,
      };
    }
  }

  return { ok: true };
}

// ─── Guest cookie helpers ───────────────────────────────────────────────────

async function readGuestUsage(): Promise<number> {
  const store = await cookies();
  const raw = store.get(GUEST_COOKIE)?.value;
  if (!raw) return 0;
  const verified = await verify(raw);
  if (!verified) return 0;
  const parsed = parseInt(verified, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export async function incrementGuestUsage(by = 1): Promise<void> {
  const store = await cookies();
  const current = await readGuestUsage();
  const signed = await sign(String(current + by));
  store.set(GUEST_COOKIE, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
  });
}
