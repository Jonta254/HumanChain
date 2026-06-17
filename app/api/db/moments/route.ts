import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

export async function GET() {
  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_moments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ moments: data });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, image_url, author_wallet, author_username, emoji } = await req.json() as {
      text: string;
      image_url?: string;
      author_wallet: string;
      author_username: string;
      emoji?: string;
    };
    if (!text || !author_wallet)
      return NextResponse.json({ error: "text and author_wallet required" }, { status: 400 });

    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_moments")
      .insert({ text, image_url: image_url ?? null, author_wallet, author_username, emoji: emoji ?? null })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ moment: data });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
