import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { getSessionWallet, isRateLimitedKV, isWalletAddress, rateLimitResponse } from "@/lib/serverApi";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_ask_answers")
      .select("*")
      .eq("thread_id", id)
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: "Failed to load answers." }, { status: 500 });
    return NextResponse.json({ answers: data });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (await isRateLimitedKV(req, "db-answers-post", 10)) return rateLimitResponse();

  const sessionWallet = getSessionWallet(req);
  if (!sessionWallet) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { body, author_wallet, author_username } = await req.json() as {
      body: string;
      author_wallet: string;
      author_username: string;
    };

    if (!body || !author_wallet || !isWalletAddress(author_wallet))
      return NextResponse.json({ error: "body and valid author_wallet required." }, { status: 400 });

    if (author_wallet.toLowerCase() !== sessionWallet)
      return NextResponse.json({ error: "Wallet mismatch." }, { status: 403 });

    if (body.length > 1000)
      return NextResponse.json({ error: "Answer must be 1000 characters or fewer." }, { status: 400 });

    const db = createServiceClient();

    const { data, error } = await db
      .from("hc_ask_answers")
      .insert({
        thread_id: id,
        body: body.trim().slice(0, 1000),
        author_wallet: sessionWallet,
        author_username: String(author_username ?? "").slice(0, 64),
      })
      .select()
      .single();

    if (error) {
      console.error("[db/answers] insert error:", error.code);
      return NextResponse.json({ error: "Failed to post answer." }, { status: 500 });
    }

    // Increment answer_count on the thread
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).rpc("increment_answer_count", { thread_id: id });

    return NextResponse.json({ answer: data });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
