import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server Supabase client — use inside Server Components, Route Handlers,
 * and Server Actions. It reads/writes the session cookie via Next's
 * cookies() store so `getUser()` resolves the logged-in user.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // The `setAll` method may be called from a Server Component —
            // in that case cookies are read-only and we can ignore it,
            // because middleware handles the refresh.
          }
        },
      },
    },
  );
}

/**
 * Service-role Supabase client — bypasses RLS. Use ONLY from server
 * code that has already performed its own authorisation (Stripe webhook,
 * convert route after auth check). Never import from client code.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
