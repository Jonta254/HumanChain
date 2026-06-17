import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const { wallet, username, points, streak, tier } = await req.json() as {
      wallet: string;
      username?: string;
      points?: number;
      streak?: number;
      tier?: string;
    };
    if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

    const db = createServiceClient();

    const { data, error } = await db
      .from("hc_users")
      .upsert(
        {
          wallet,
          username: username ?? "Human",
          points: points ?? 0,
          streak: streak ?? 0,
          tier: tier ?? "Bronze",
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "wallet" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
