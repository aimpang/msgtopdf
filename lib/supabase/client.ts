"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — safe to import from Client Components.
 * Reads the public anon key and never touches the service role.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
