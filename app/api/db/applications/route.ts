import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { getSessionWallet, isRateLimited, isWalletAddress, rateLimitResponse } from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "applications", 10)) return rateLimitResponse();

  const sessionWallet = getSessionWallet(req);
  if (!sessionWallet) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { listing_id, listing_title, applicant_wallet, message } = (await req.json()) as {
      listing_id?: string;
      listing_title?: string;
      applicant_wallet?: string;
      message?: string;
    };

    if (!listing_id || !applicant_wallet || !isWalletAddress(applicant_wallet)) {
      return NextResponse.json(
        { error: "listing_id and valid applicant_wallet are required." },
        { status: 400 },
      );
    }

    if (applicant_wallet.toLowerCase() !== sessionWallet) {
      return NextResponse.json({ error: "Wallet mismatch." }, { status: 403 });
    }

    if (message && message.length > 500) {
      return NextResponse.json({ error: "Message must be 500 characters or fewer." }, { status: 400 });
    }

    const db = createServiceClient();
    const { error } = await db.from("hc_applications").insert({
      listing_id: String(listing_id).slice(0, 64),
      listing_title: listing_title ? String(listing_title).slice(0, 120) : null,
      applicant_wallet: sessionWallet,
      message: message ? String(message).trim().slice(0, 500) : null,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[db/applications] insert error:", error.code);
      return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
