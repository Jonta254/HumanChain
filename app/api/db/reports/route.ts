import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { isRateLimited, rateLimitResponse } from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "reports", 5)) return rateLimitResponse();

  try {
    const { target_type, target_id, reason, reporter_wallet } = (await req.json()) as {
      target_type?: string;
      target_id?: string;
      reason?: string;
      reporter_wallet?: string;
    };

    if (!target_type || !target_id || !reason) {
      return NextResponse.json(
        { error: "target_type, target_id, and reason are required." },
        { status: 400 },
      );
    }

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
      return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
