import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Browser-safe client — uses anon key with RLS
export const supabase = createClient<Database>(url, anon);

// Server-only client — uses service role key, bypasses RLS
// Returns an untyped client so route handlers can use .insert()/.upsert()
// without fighting complex Omit inference chains.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createServiceClient(): ReturnType<typeof createClient<any>> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(url, serviceKey, {
    auth: { persistSession: false },
  });
}
