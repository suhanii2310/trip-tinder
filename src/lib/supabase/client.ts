"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./env";

let client: SupabaseClient | null = null;

// One shared client per tab, so realtime channels and the anonymous session are reused.
export function getBrowserClient(): SupabaseClient {
  client ??= createBrowserClient(supabaseUrl, supabasePublishableKey);
  return client;
}
