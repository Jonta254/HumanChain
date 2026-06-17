import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Lazy getters — never create clients at module evaluation time.
// NEXT_PUBLIC_* vars are baked in at build time; if they're missing the
// build would throw. Defer until the first actual DB call instead.

export function getBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase env vars not configured");
  return createClient<Database>(url, anon);
}

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase env vars not configured");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(url, serviceKey, { auth: { persistSession: false } });
}
