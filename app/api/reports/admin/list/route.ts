import { NextRequest } from "next/server";
import { noStoreJson } from "@/lib/serverApi";
import { extractAdminTokenFromCookie, validateAdminToken, extractCookieValue } from "@/lib/admin/session";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? undefined;
    const token = extractAdminTokenFromCookie(cookieHeader);
    if (!validateAdminToken(token)) return noStoreJson({ ok: false, error: "Unauthorized" }, { status: 401 });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from("reports")
        .select("id, question, answers, status, requested_by, created_at")
        .eq("status", "queued")
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) return noStoreJson({ ok: false, error: error.message }, { status: 500 });
      return noStoreJson({ ok: true, reports: data });
    }

    return noStoreJson({ ok: false, error: "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 501 });
  } catch (err: any) {
    return noStoreJson({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
