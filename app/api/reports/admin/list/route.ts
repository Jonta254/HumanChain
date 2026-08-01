import { NextRequest } from "next/server";
import { noStoreJson } from "@/lib/serverApi";

export async function GET(req: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return noStoreJson({ ok: false, error: "Admin key not configured on server." }, { status: 500 });

  const provided = req.headers.get("x-admin-key");
  if (provided !== adminKey) return noStoreJson({ ok: false, error: "Unauthorized" }, { status: 401 });

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from("reports")
        .select("id, question, answers, status, requested_by, created_at")
        .eq("status", "queued")
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) return noStoreJson({ ok: false, error: error.message }, { status: 500 });
      return noStoreJson({ ok: true, reports: data });
    } catch (err: any) {
      return noStoreJson({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
    }
  }

  return noStoreJson({ ok: false, error: "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 501 });
}
