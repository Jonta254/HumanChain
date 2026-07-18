import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { getSessionWallet, isRateLimitedKV, isWalletAddress, noStoreJson, rateLimitResponse, readJsonBody } from "@/lib/serverApi";

// GET ?wallet=0x..&type=followers|following — list of {wallet, username} for
// that side of the graph. No auth required: follow relationships are public
// (see the schema.sql comment on the "public read follows" policy).
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet")?.toLowerCase();
  const type = req.nextUrl.searchParams.get("type") === "following" ? "following" : "followers";
  if (!wallet || !isWalletAddress(wallet)) {
    return noStoreJson({ error: "Valid wallet is required." }, { status: 400 });
  }

  try {
    const db = createServiceClient();
    const column = type === "following" ? "follower_wallet" : "followed_wallet";
    const otherColumn = type === "following" ? "followed_wallet" : "follower_wallet";
    const { data: edges, error } = await db
      .from("hc_follows")
      .select(otherColumn)
      .eq(column, wallet)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[db/follows] select error:", error.code);
      return noStoreJson({ error: "Failed to load follow list." }, { status: 500 });
    }
    const wallets = (edges ?? []).map((e) => (e as Record<string, string>)[otherColumn]);
    if (wallets.length === 0) return noStoreJson({ ok: true, users: [] });

    const { data: users, error: usersError } = await db.from("hc_users").select("wallet, username, tier").in("wallet", wallets);
    if (usersError) {
      console.error("[db/follows] users select error:", usersError.code);
      return noStoreJson({ error: "Failed to load follow list." }, { status: 500 });
    }
    return noStoreJson({ ok: true, users: users ?? [] });
  } catch (err) {
    if (err instanceof Error && err.message === "Supabase env vars not configured") {
      return noStoreJson({ ok: false, pendingSetup: true, users: [] }, { status: 503 });
    }
    console.error("[db/follows] unexpected error:", err);
    return noStoreJson({ error: "Internal error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "follows-post", 30)) return rateLimitResponse();

  const wallet = getSessionWallet(req);
  if (!wallet) return noStoreJson({ error: "Sign in required." }, { status: 401 });

  const body = await readJsonBody<{ wallet?: string }>(req);
  const target = body?.wallet?.toLowerCase();
  if (!target || !isWalletAddress(target)) return noStoreJson({ error: "Valid wallet is required." }, { status: 400 });
  if (target === wallet) return noStoreJson({ error: "You can't follow yourself." }, { status: 400 });

  try {
    const db = createServiceClient();
    const { error } = await db.from("hc_follows").upsert(
      { follower_wallet: wallet, followed_wallet: target },
      { onConflict: "follower_wallet,followed_wallet" },
    );
    if (error) {
      console.error("[db/follows] insert error:", error.code);
      return noStoreJson({ error: "Failed to follow." }, { status: 500 });
    }
    return noStoreJson({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Supabase env vars not configured") {
      return noStoreJson({ ok: false, pendingSetup: true }, { status: 503 });
    }
    console.error("[db/follows] unexpected error:", err);
    return noStoreJson({ error: "Internal error." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const wallet = getSessionWallet(req);
  if (!wallet) return noStoreJson({ error: "Sign in required." }, { status: 401 });

  const body = await readJsonBody<{ wallet?: string }>(req);
  const target = body?.wallet?.toLowerCase();
  if (!target || !isWalletAddress(target)) return noStoreJson({ error: "Valid wallet is required." }, { status: 400 });

  try {
    const db = createServiceClient();
    const { error } = await db.from("hc_follows").delete().eq("follower_wallet", wallet).eq("followed_wallet", target);
    if (error) {
      console.error("[db/follows] delete error:", error.code);
      return noStoreJson({ error: "Failed to unfollow." }, { status: 500 });
    }
    return noStoreJson({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Supabase env vars not configured") {
      return noStoreJson({ ok: false, pendingSetup: true }, { status: 503 });
    }
    console.error("[db/follows] unexpected error:", err);
    return noStoreJson({ error: "Internal error." }, { status: 500 });
  }
}
