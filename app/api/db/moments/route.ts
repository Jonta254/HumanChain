import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { getSessionWallet, isRateLimitedKV, isWalletAddress, rateLimitResponse } from "@/lib/serverApi";

export async function GET() {
  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_moments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) return NextResponse.json({ error: "Failed to load moments." }, { status: 500 });
    return NextResponse.json({ moments: data });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "db-moments-post", 10)) return rateLimitResponse();

  const sessionWallet = getSessionWallet(req);
  if (!sessionWallet) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { text, image_url, author_wallet, author_username, emoji } = await req.json() as {
      text: string;
      image_url?: string;
      author_wallet: string;
      author_username: string;
      emoji?: string;
    };

    if (!text || typeof text !== "string" || text.trim().length < 2)
      return NextResponse.json({ error: "Moment text must be at least 2 characters." }, { status: 400 });

    if (!author_wallet || !isWalletAddress(author_wallet))
      return NextResponse.json({ error: "Valid author_wallet required." }, { status: 400 });

    if (author_wallet.toLowerCase() !== sessionWallet)
      return NextResponse.json({ error: "Wallet mismatch." }, { status: 403 });

    if (text.length > 280)
      return NextResponse.json({ error: "Moment text must be 280 characters or fewer." }, { status: 400 });

    const safeImageUrl =
      typeof image_url === "string" && image_url.startsWith("https://") ? image_url.slice(0, 512) : null;

    const safeUsername = typeof author_username === "string"
      ? author_username.replace(/[<>"']/g, "").slice(0, 64)
      : "";

    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_moments")
      .insert({
        text: text.trim().slice(0, 280),
        image_url: safeImageUrl,
        author_wallet: sessionWallet,
        author_username: safeUsername,
        emoji: typeof emoji === "string" ? emoji.slice(0, 8) : null,
      })
      .select()
      .single();

    if (error) {
      console.error("[db/moments] insert error:", error.code);
      return NextResponse.json({ error: "Failed to post moment." }, { status: 500 });
    }
    return NextResponse.json({ moment: data });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
