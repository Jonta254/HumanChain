import { NextRequest } from "next/server";
import { noStoreJson } from "@/lib/serverApi";
import { extractAdminTokenFromCookie, validateAdminToken } from "@/lib/admin/session";
import { validateCsrfToken } from "@/lib/admin/csrf";

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? undefined;
    const token = extractAdminTokenFromCookie(cookieHeader);
    if (!validateAdminToken(token)) return noStoreJson({ ok: false, error: "Unauthorized" }, { status: 401 });

    // parse body (support JSON or form submissions)
    const ct = (req.headers.get("content-type") ?? "").toLowerCase();
    let body: any = {};
    if (ct.includes("application/json")) {
      body = await req.json().catch(() => ({}));
    } else {
      const form = await req.formData();
      body.id = form.get("id") as string | null;
      body.result = form.get("result") as string | null;
      body.csrf_token = form.get("csrf_token") as string | null;
    }

    const { id, result, csrf_token } = body ?? {};
    if (!id) return noStoreJson({ ok: false, error: "missing id" }, { status: 400 });
    if (!csrf_token || !validateCsrfToken(String(csrf_token), token)) return noStoreJson({ ok: false, error: "invalid csrf" }, { status: 403 });

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

      // attempt to parse JSON result if provided
      let parsedResult: any = null;
      if (typeof result === "string") {
        try {
          parsedResult = JSON.parse(result);
        } catch (e) {
          parsedResult = { text: result };
        }
      }

      const updates: any = { status: "ready", updated_at: new Date().toISOString() };
      if (parsedResult !== null) updates.result = parsedResult;

      const { error } = await supabase.from("reports").update(updates).eq("id", id);
      if (error) return noStoreJson({ ok: false, error: error.message }, { status: 500 });

      // minimal audit log
      try {
        const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
        await supabase.from("admin_audit").insert([{ action: "complete_report", report_id: id, actor: "admin", ip, created_at: new Date().toISOString() }]);
      } catch (e) {
        // audit failure should not block the main flow
      }

      return noStoreJson({ ok: true });
    }

    return noStoreJson({ ok: false, error: "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 501 });
  } catch (err: any) {
    return noStoreJson({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
