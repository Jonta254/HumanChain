import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { getSessionWallet, isRateLimited, isWalletAddress, rateLimitResponse } from "@/lib/serverApi";

export async function GET() {
  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_ask_threads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return NextResponse.json({ error: "Failed to load threads." }, { status: 500 });
    return NextResponse.json({ threads: data });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "db-threads-post", 10)) return rateLimitResponse();

  const sessionWallet = getSessionWallet(req);
  if (!sessionWallet) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { question, author_wallet, author_username } = await req.json() as {
      question: string;
      author_wallet: string;
      author_username: string;
    };

    if (!question || !author_wallet || !isWalletAddress(author_wallet))
      return NextResponse.json({ error: "question and valid author_wallet required." }, { status: 400 });

    if (author_wallet.toLowerCase() !== sessionWallet)
      return NextResponse.json({ error: "Wallet mismatch." }, { status: 403 });

    if (question.length > 500)
      return NextResponse.json({ error: "Question must be 500 characters or fewer." }, { status: 400 });

    const safeUsername = typeof author_username === "string" ? author_username.slice(0, 64) : "";

    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_ask_threads")
      .insert({ question: question.trim(), author_wallet: sessionWallet, author_username: safeUsername })
      .select()
      .single();

    if (error) {
      console.error("[db/threads] insert error:", error.code);
      return NextResponse.json({ error: "Failed to post question." }, { status: 500 });
    }
    return NextResponse.json({ thread: data });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
