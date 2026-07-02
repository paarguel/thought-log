/**
 * Browser Supabase client.
 *
 * Cloud sync is optional (Obsidian-style): the app is fully functional
 * without these env vars. All Supabase calls happen client-side so
 * worksheet content never passes through our own server (KTD8).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function cloudConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Returns null when cloud sync is not configured. */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!cloudConfigured() || typeof window === "undefined") {
    client = null;
    return client;
  }
  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}
