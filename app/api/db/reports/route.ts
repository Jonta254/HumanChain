import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { isRateLimitedKV, noStoreJson, readJsonBody, rateLimitResponse } from "@/lib/serverApi";

type ReportBody = {
  target_type?: string;
  target_id?: string;
  reason?: string;
  reporter_wallet?: string;
};

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "reports", 5)) return rateLimitResponse();

  const body = await readJsonBody<ReportBody>(req);
  const { target_type, target_id, reason, reporter_wallet } = body ?? {};

  if (!target_type || !target_id || !reason) {
    return noStoreJson({ error: "target_type, target_id, and reason are required." }, { status: 400 });
  }

  try {
    const db = createServiceClient();
    const { error } = await db.from("hc_reports").insert({
      target_type,
      target_id,
      reason,
      reporter_wallet: reporter_wallet ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[db/reports] insert error:", error.code);
      return noStoreJson({ error: "Failed to submit report." }, { status: 500 });
    }
    return noStoreJson({ ok: true });
  } catch (err) {
    // Supabase not configured yet — tell the client honestly instead of a
    // generic 500, matching /api/ai/status's pendingSetup convention.
    if (err instanceof Error && err.message === "Supabase env vars not configured") {
      return noStoreJson({ ok: false, pendingSetup: true }, { status: 503 });
    }
    console.error("[db/reports] unexpected error:", err);
    return noStoreJson({ error: "Internal error." }, { status: 500 });
  }
}

// Founder/moderator-only read of the report queue. No real admin auth system
// exists yet (see network-readiness memo) — gated behind a shared secret set
// in MODERATION_SECRET, sent as the x-moderation-secret header. Upgrade to
// real role-based auth once moderation moves past one person.
export async function GET(req: NextRequest) {
  const secret = process.env.MODERATION_SECRET;
  if (!secret) {
    return noStoreJson({ ok: false, pendingSetup: true, reason: "MODERATION_SECRET not configured" }, { status: 503 });
  }
  if (req.headers.get("x-moderation-secret") !== secret) {
    return noStoreJson({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[db/reports] select error:", error.code);
      return noStoreJson({ error: "Failed to load reports." }, { status: 500 });
    }
    return noStoreJson({ ok: true, reports: data ?? [] });
  } catch (err) {
    if (err instanceof Error && err.message === "Supabase env vars not configured") {
      return noStoreJson({ ok: false, pendingSetup: true }, { status: 503 });
    }
    console.error("[db/reports] unexpected error:", err);
    return noStoreJson({ error: "Internal error." }, { status: 500 });
  }
}
