import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./env";

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

// Public reads on the server (places, public plan page). Same rights as a signed-out browser.
export function getPublicServerClient(): SupabaseClient {
  return createClient(supabaseUrl, supabasePublishableKey, noSession);
}

// Full access, bypasses row-level security. Only for server routes that check
// permissions themselves (writing plans).
export function getAdminClient(): SupabaseClient {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient(supabaseUrl, secret, noSession);
}
