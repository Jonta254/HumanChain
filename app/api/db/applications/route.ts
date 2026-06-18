import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { isRateLimited, rateLimitResponse } from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "applications", 10)) return rateLimitResponse();

  try {
    const { listing_id, listing_title, applicant_wallet, message } = (await req.json()) as {
      listing_id?: string;
      listing_title?: string;
      applicant_wallet?: string;
      message?: string;
    };

    if (!listing_id || !applicant_wallet) {
      return NextResponse.json(
        { error: "listing_id and applicant_wallet are required." },
        { status: 400 },
      );
    }

    const db = createServiceClient();
    const { error } = await db.from("hc_applications").insert({
      listing_id,
      listing_title: listing_title ?? null,
      applicant_wallet,
      message: message ?? null,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
