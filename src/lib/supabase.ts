import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError } from "@/lib/db-errors";

/**
 * Server-side Supabase client (service role).
 * Bypasses RLS — used only in API routes / server components with NextAuth.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
let admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (admin) return admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new DatabaseError(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env.",
    );
  }

  admin = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return admin;
}
