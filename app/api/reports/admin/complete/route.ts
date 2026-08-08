import { NextRequest } from "next/server";
import { noStoreJson, readJsonBody } from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return noStoreJson({ ok: false, error: "Admin key not configured on server." }, { status: 500 });

  const provided = req.headers.get("x-admin-key");
  if (provided !== adminKey) return noStoreJson({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await readJsonBody<{ id?: string; result?: any }>(req);
  const { id, result } = body ?? {};
  if (!id) return noStoreJson({ ok: false, error: "missing id" }, { status: 400 });

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

      const updates: any = { status: "ready", updated_at: new Date().toISOString() };
      if (result !== undefined) updates.result = result;

      const { error } = await supabase.from("reports").update(updates).eq("id", id);
      if (error) return noStoreJson({ ok: false, error: error.message }, { status: 500 });

      // Optionally: trigger downstream notifications (email/push) — left as TODO.
      return noStoreJson({ ok: true });
    } catch (err: any) {
      return noStoreJson({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
    }
  }

  return noStoreJson({ ok: false, error: "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 501 });
}
