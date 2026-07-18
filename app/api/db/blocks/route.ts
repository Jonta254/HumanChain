import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { getSessionWallet, isRateLimitedKV, noStoreJson, rateLimitResponse, readJsonBody } from "@/lib/serverApi";

// Not wired into any UI yet — this route exists so the client-side blocking
// logic (lib/humanchain/blocklist.ts) has something real to call the moment
// Supabase is provisioned. Session-scoped: a wallet can only read or write
// its own block list, identified from the SIWE session cookie, never from
// a client-supplied wallet param.

export async function GET(req: NextRequest) {
  const wallet = getSessionWallet(req);
  if (!wallet) return noStoreJson({ error: "Sign in required." }, { status: 401 });

  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_blocks")
      .select("blocked_wallet, created_at")
      .eq("blocker_wallet", wallet)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[db/blocks] select error:", error.code);
      return noStoreJson({ error: "Failed to load blocks." }, { status: 500 });
    }
    return noStoreJson({ ok: true, blocks: data ?? [] });
  } catch (err) {
    if (err instanceof Error && err.message === "Supabase env vars not configured") {
      return noStoreJson({ ok: false, pendingSetup: true, blocks: [] }, { status: 503 });
    }
    console.error("[db/blocks] unexpected error:", err);
    return noStoreJson({ error: "Internal error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "blocks", 20)) return rateLimitResponse();

  const wallet = getSessionWallet(req);
  if (!wallet) return noStoreJson({ error: "Sign in required." }, { status: 401 });

  const body = await readJsonBody<{ blocked_wallet?: string }>(req);
  const blockedWallet = body?.blocked_wallet?.toLowerCase();
  if (!blockedWallet) return noStoreJson({ error: "blocked_wallet is required." }, { status: 400 });
  if (blockedWallet === wallet) return noStoreJson({ error: "You can't block yourself." }, { status: 400 });

  try {
    const db = createServiceClient();
    const { error } = await db
      .from("hc_blocks")
      .upsert({ blocker_wallet: wallet, blocked_wallet: blockedWallet }, { onConflict: "blocker_wallet,blocked_wallet" });

    if (error) {
      console.error("[db/blocks] insert error:", error.code);
      return noStoreJson({ error: "Failed to block user." }, { status: 500 });
    }
    return noStoreJson({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Supabase env vars not configured") {
      return noStoreJson({ ok: false, pendingSetup: true }, { status: 503 });
    }
    console.error("[db/blocks] unexpected error:", err);
    return noStoreJson({ error: "Internal error." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const wallet = getSessionWallet(req);
  if (!wallet) return noStoreJson({ error: "Sign in required." }, { status: 401 });

  const body = await readJsonBody<{ blocked_wallet?: string }>(req);
  const blockedWallet = body?.blocked_wallet?.toLowerCase();
  if (!blockedWallet) return noStoreJson({ error: "blocked_wallet is required." }, { status: 400 });

  try {
    const db = createServiceClient();
    const { error } = await db
      .from("hc_blocks")
      .delete()
      .eq("blocker_wallet", wallet)
      .eq("blocked_wallet", blockedWallet);

    if (error) {
      console.error("[db/blocks] delete error:", error.code);
      return noStoreJson({ error: "Failed to unblock user." }, { status: 500 });
    }
    return noStoreJson({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Supabase env vars not configured") {
      return noStoreJson({ ok: false, pendingSetup: true }, { status: 503 });
    }
    console.error("[db/blocks] unexpected error:", err);
    return noStoreJson({ error: "Internal error." }, { status: 500 });
  }
}
