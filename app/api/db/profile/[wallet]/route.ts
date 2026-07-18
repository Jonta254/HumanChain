import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { getSessionWallet, isWalletAddress, noStoreJson } from "@/lib/serverApi";
import type { PublicProfile, ProfileActivityItem } from "@/types/profile";

// Composite endpoint: one round trip returns identity, reputation summary,
// marketplace summary, contributions, and recent activity — the profile UI
// needs all of these together, so this is deliberately one endpoint instead
// of the five separate ones a fully granular design would have (GET profile,
// GET activity, GET reputation summary, GET marketplace summary, GET
// contributions all overlap in what they read from hc_users and are cheap
// to compute together). Every field respects the owner's visibility flags.
export async function GET(req: NextRequest, { params }: { params: Promise<{ wallet: string }> }) {
  const { wallet: rawWallet } = await params;
  const wallet = rawWallet.toLowerCase();
  if (!isWalletAddress(wallet)) {
    return noStoreJson({ error: "Invalid wallet address." }, { status: 400 });
  }

  const viewerWallet = getSessionWallet(req);
  const isSelf = viewerWallet === wallet;

  try {
    const db = createServiceClient();
    const { data: user, error: userError } = await db
      .from("hc_users")
      .select("wallet, username, tier, joined_at, bio, avatar_url, points, streak, profile_visibility, activity_visibility, marketplace_visibility, discoverable")
      .eq("wallet", wallet)
      .maybeSingle();

    if (userError) {
      console.error("[db/profile] user select error:", userError.code);
      return noStoreJson({ error: "Failed to load profile." }, { status: 500 });
    }
    if (!user) {
      return noStoreJson({ error: "Profile not found." }, { status: 404 });
    }

    const [followerCountRes, followingCountRes, isFollowingRes] = await Promise.all([
      db.from("hc_follows").select("*", { count: "exact", head: true }).eq("followed_wallet", wallet),
      db.from("hc_follows").select("*", { count: "exact", head: true }).eq("follower_wallet", wallet),
      viewerWallet && !isSelf
        ? db.from("hc_follows").select("*", { count: "exact", head: true }).eq("follower_wallet", viewerWallet).eq("followed_wallet", wallet)
        : Promise.resolve({ count: null }),
    ]);

    const restricted = user.profile_visibility === "private" && !isSelf;

    const base: PublicProfile = {
      wallet: user.wallet,
      username: user.username,
      tier: user.tier,
      joinedAt: user.joined_at,
      isSelf,
      restricted,
      bio: null,
      avatarUrl: null,
      points: null,
      streak: null,
      followerCount: followerCountRes.count ?? 0,
      followingCount: followingCountRes.count ?? 0,
      isFollowing: viewerWallet && !isSelf ? Boolean(isFollowingRes.count) : null,
      marketplaceSummary: null,
      contributions: null,
      recentActivity: null,
      settings: isSelf
        ? {
            profileVisibility: user.profile_visibility,
            activityVisibility: user.activity_visibility,
            marketplaceVisibility: user.marketplace_visibility,
            discoverable: user.discoverable,
          }
        : null,
    };

    if (restricted) {
      return noStoreJson({ ok: true, profile: base });
    }

    base.bio = user.bio;
    base.avatarUrl = user.avatar_url;
    base.points = user.points;
    base.streak = user.streak;

    const activityAllowed = isSelf || user.activity_visibility === "public";
    const marketplaceAllowed = isSelf || user.marketplace_visibility === "public";

    const queries: PromiseLike<unknown>[] = [];

    if (activityAllowed) {
      queries.push(
        db.from("hc_moments").select("text, created_at").eq("author_wallet", wallet).order("created_at", { ascending: false }).limit(5),
        db.from("hc_ask_threads").select("question, created_at").eq("author_wallet", wallet).order("created_at", { ascending: false }).limit(5),
        db.from("hc_ask_answers").select("body, created_at").eq("author_wallet", wallet).order("created_at", { ascending: false }).limit(5),
        db.from("hc_moments").select("*", { count: "exact", head: true }).eq("author_wallet", wallet),
        db.from("hc_ask_threads").select("*", { count: "exact", head: true }).eq("author_wallet", wallet),
        db.from("hc_ask_answers").select("*", { count: "exact", head: true }).eq("author_wallet", wallet),
      );
    }
    if (marketplaceAllowed) {
      queries.push(
        db.from("hc_marketplace").select("*", { count: "exact", head: true }).eq("seller_wallet", wallet).eq("status", "active"),
        db.from("hc_marketplace").select("*", { count: "exact", head: true }).eq("seller_wallet", wallet).eq("status", "sold"),
      );
    }

    const results = await Promise.all(queries);
    let i = 0;
    if (activityAllowed) {
      type Row = { text?: string; question?: string; body?: string; created_at: string };
      const moments = (results[i++] as { data: Row[] | null }).data ?? [];
      const threads = (results[i++] as { data: Row[] | null }).data ?? [];
      const answers = (results[i++] as { data: Row[] | null }).data ?? [];
      const momentsCount = (results[i++] as { count: number | null }).count ?? 0;
      const threadsCount = (results[i++] as { count: number | null }).count ?? 0;
      const answersCount = (results[i++] as { count: number | null }).count ?? 0;

      const activity: ProfileActivityItem[] = [
        ...moments.map((m): ProfileActivityItem => ({ type: "moment", text: m.text ?? "", createdAt: m.created_at })),
        ...threads.map((t): ProfileActivityItem => ({ type: "question", text: t.question ?? "", createdAt: t.created_at })),
        ...answers.map((a): ProfileActivityItem => ({ type: "answer", text: a.body ?? "", createdAt: a.created_at })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      base.recentActivity = activity;
      base.contributions = { moments: momentsCount, threads: threadsCount, answers: answersCount };
    }
    if (marketplaceAllowed) {
      const activeCount = (results[i++] as { count: number | null }).count ?? 0;
      const soldCount = (results[i++] as { count: number | null }).count ?? 0;
      base.marketplaceSummary = { activeListings: activeCount, soldListings: soldCount };
    }

    return noStoreJson({ ok: true, profile: base });
  } catch (err) {
    if (err instanceof Error && err.message === "Supabase env vars not configured") {
      return noStoreJson({ ok: false, pendingSetup: true }, { status: 503 });
    }
    console.error("[db/profile] unexpected error:", err);
    return noStoreJson({ error: "Internal error." }, { status: 500 });
  }
}
