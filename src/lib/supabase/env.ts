// Reads the Supabase settings. NEXT_PUBLIC_ values are safe in the browser;
// the secret key must only be read on the server.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const hasSupabaseEnv = Boolean(supabaseUrl && supabasePublishableKey);
