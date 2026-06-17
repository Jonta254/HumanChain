import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_ask_answers")
      .select("*")
      .eq("thread_id", id)
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ answers: data });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { body, author_wallet, author_username } = await req.json() as {
      body: string;
      author_wallet: string;
      author_username: string;
    };
    if (!body || !author_wallet)
      return NextResponse.json({ error: "body and author_wallet required" }, { status: 400 });

    const db = createServiceClient();

    const { data, error } = await db
      .from("hc_ask_answers")
      .insert({ thread_id: id, body, author_wallet, author_username })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Increment answer_count on the thread
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).rpc("increment_answer_count", { thread_id: id });

    return NextResponse.json({ answer: data });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
