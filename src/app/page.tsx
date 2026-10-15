import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getPublicServerClient } from "@/lib/supabase/server";

// Step 1 placeholder: proves the deploy works and can reach the database.
// Replaced by the Welcome screen in step 2.
export const dynamic = "force-dynamic";

async function placeCount(): Promise<string> {
  if (!hasSupabaseEnv) return "Database not connected yet (env vars missing)";
  const { count, error } = await getPublicServerClient()
    .from("places")
    .select("*", { count: "exact", head: true })
    .eq("city", "New York");
  if (error) return `Database error: ${error.message}`;
  return `Database connected: ${count} New York places`;
}

export default async function Home() {
  const status = await placeCount();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
      <div className="grid size-[68px] place-items-center rounded-[20px] bg-coral" aria-hidden />
      <h1 className="text-[38px] leading-tight font-bold tracking-tight">Trip Tinder</h1>
      <p className="text-lg text-muted">Swipe together, travel together.</p>
      <p className="mt-6 rounded-card bg-surface px-4 py-3 text-sm shadow-[0_0_0_1px_var(--line)]" data-testid="db-status">
        {status}
      </p>
    </div>
  );
}
