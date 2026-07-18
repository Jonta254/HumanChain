import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { getSessionWallet, isRateLimitedKV, noStoreJson, rateLimitResponse, readJsonBody } from "@/lib/serverApi";

type ProfilePatchBody = {
  bio?: string;
  avatarUrl?: string;
  profileVisibility?: "public" | "private";
  activityVisibility?: "public" | "private";
  marketplaceVisibility?: "public" | "private";
  discoverable?: boolean;
};

const VISIBILITY_VALUES = new Set(["public", "private"]);

export async function PATCH(req: NextRequest) {
  if (await isRateLimitedKV(req, "profile-patch", 15)) return rateLimitResponse();

  const wallet = getSessionWallet(req);
  if (!wallet) return noStoreJson({ error: "Sign in required." }, { status: 401 });

  const body = await readJsonBody<ProfilePatchBody>(req);
  if (!body) return noStoreJson({ error: "Invalid request body." }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body.bio !== undefined) {
    if (typeof body.bio !== "string" || body.bio.length > 280) {
      return noStoreJson({ error: "Bio must be 280 characters or fewer." }, { status: 400 });
    }
    update.bio = body.bio.trim();
  }
  if (body.avatarUrl !== undefined) {
    if (typeof body.avatarUrl !== "string" || body.avatarUrl.length > 2000) {
      return noStoreJson({ error: "Invalid avatar URL." }, { status: 400 });
    }
    update.avatar_url = body.avatarUrl;
  }
  for (const [field, column] of [
    ["profileVisibility", "profile_visibility"],
    ["activityVisibility", "activity_visibility"],
    ["marketplaceVisibility", "marketplace_visibility"],
  ] as const) {
    const value = body[field];
    if (value !== undefined) {
      if (!VISIBILITY_VALUES.has(value)) {
        return noStoreJson({ error: `${field} must be "public" or "private".` }, { status: 400 });
      }
      update[column] = value;
    }
  }
  if (body.discoverable !== undefined) {
    if (typeof body.discoverable !== "boolean") {
      return noStoreJson({ error: "discoverable must be a boolean." }, { status: 400 });
    }
    update.discoverable = body.discoverable;
  }

  if (Object.keys(update).length === 0) {
    return noStoreJson({ error: "No valid fields to update." }, { status: 400 });
  }

  try {
    const db = createServiceClient();
    const { data, error } = await db.from("hc_users").update(update).eq("wallet", wallet).select().maybeSingle();
    if (error) {
      console.error("[db/profile] update error:", error.code);
      return noStoreJson({ error: "Failed to update profile." }, { status: 500 });
    }
    if (!data) {
      // A wallet with no hc_users row yet (never synced) has nothing to
      // update — sync happens on login, before profile editing is reachable.
      return noStoreJson({ error: "Sign in and sync your account before editing your profile." }, { status: 404 });
    }
    return noStoreJson({ ok: true, profile: data });
  } catch (err) {
    if (err instanceof Error && err.message === "Supabase env vars not configured") {
      return noStoreJson({ ok: false, pendingSetup: true }, { status: 503 });
    }
    console.error("[db/profile] unexpected error:", err);
    return noStoreJson({ error: "Internal error." }, { status: 500 });
  }
}
