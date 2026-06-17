import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

export async function GET() {
  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_ask_threads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ threads: data });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { question, author_wallet, author_username } = await req.json() as {
      question: string;
      author_wallet: string;
      author_username: string;
    };
    if (!question || !author_wallet)
      return NextResponse.json({ error: "question and author_wallet required" }, { status: 400 });

    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_ask_threads")
      .insert({ question, author_wallet, author_username })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ thread: data });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
