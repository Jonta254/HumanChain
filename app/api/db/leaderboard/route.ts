import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

export async function GET() {
  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_users")
      .select("wallet, username, points, streak, tier")
      .order("points", { ascending: false })
      .limit(20);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ranked = (data ?? []).map((u: any, i: number) => ({ ...u, rank: i + 1 }));
    return NextResponse.json({ leaderboard: ranked });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
