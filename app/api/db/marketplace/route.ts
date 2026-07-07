import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { getSessionWallet, isRateLimitedKV, isWalletAddress, rateLimitResponse } from "@/lib/serverApi";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") ?? "active";
    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_marketplace")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) return NextResponse.json({ error: "Failed to load listings." }, { status: 500 });
    return NextResponse.json({ listings: data });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "db-marketplace-post", 10)) return rateLimitResponse();

  const sessionWallet = getSessionWallet(req);
  if (!sessionWallet) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      title: string;
      price: number;
      condition: string;
      category: string;
      description?: string;
      seller_wallet: string;
      seller_username: string;
      location?: string;
    };

    if (!body.title || !body.seller_wallet || !isWalletAddress(body.seller_wallet))
      return NextResponse.json({ error: "title and valid seller_wallet required." }, { status: 400 });

    if (body.seller_wallet.toLowerCase() !== sessionWallet)
      return NextResponse.json({ error: "Wallet mismatch." }, { status: 403 });

    if (body.title.length > 120)
      return NextResponse.json({ error: "Title must be 120 characters or fewer." }, { status: 400 });

    if (body.description && body.description.length > 1000)
      return NextResponse.json({ error: "Description must be 1000 characters or fewer." }, { status: 400 });

    const price = typeof body.price === "number" ? body.price : parseFloat(String(body.price));
    if (!Number.isFinite(price) || price < 0 || price > 1_000_000)
      return NextResponse.json({ error: "Invalid price." }, { status: 400 });

    const safeBody = {
      title: body.title.trim().slice(0, 120),
      price,
      condition: String(body.condition ?? "").slice(0, 32),
      category: String(body.category ?? "").slice(0, 64),
      description: body.description ? body.description.trim().slice(0, 1000) : null,
      seller_wallet: sessionWallet,
      seller_username: String(body.seller_username ?? "").slice(0, 64),
      location: body.location ? String(body.location).slice(0, 128) : null,
    };

    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_marketplace")
      .insert(safeBody)
      .select()
      .single();

    if (error) {
      console.error("[db/marketplace] insert error:", error.code);
      return NextResponse.json({ error: "Failed to create listing." }, { status: 500 });
    }
    return NextResponse.json({ listing: data });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
