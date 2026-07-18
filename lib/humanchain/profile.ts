import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { PublicProfile, ProfilePrivacySettings } from "@/types/profile";

export type ProfileFetchResult =
  | { ok: true; profile: PublicProfile }
  | { ok: false; pendingSetup?: boolean; notFound?: boolean; error?: string };

export async function fetchProfile(wallet: string): Promise<ProfileFetchResult> {
  try {
    const res = await fetchWithTimeout(`/api/db/profile/${wallet}`, { timeoutMs: 8_000 });
    if (res.status === 404) return { ok: false, notFound: true };
    if (res.status === 503) return { ok: false, pendingSetup: true };
    const data = (await res.json()) as { ok?: boolean; profile?: PublicProfile; error?: string };
    if (!data.ok || !data.profile) return { ok: false, error: data.error };
    return { ok: true, profile: data.profile };
  } catch {
    return { ok: false, error: "Couldn't reach the server." };
  }
}

export async function updateProfile(patch: Partial<{ bio: string; avatarUrl: string } & ProfilePrivacySettings>): Promise<{ ok: boolean; pendingSetup?: boolean }> {
  try {
    const res = await fetchWithTimeout("/api/db/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
      timeoutMs: 8_000,
    });
    return (await res.json()) as { ok: boolean; pendingSetup?: boolean };
  } catch {
    return { ok: false };
  }
}

export async function followUser(wallet: string): Promise<{ ok: boolean; pendingSetup?: boolean }> {
  try {
    const res = await fetchWithTimeout("/api/db/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
      timeoutMs: 8_000,
    });
    return (await res.json()) as { ok: boolean; pendingSetup?: boolean };
  } catch {
    return { ok: false };
  }
}

export async function unfollowUser(wallet: string): Promise<{ ok: boolean; pendingSetup?: boolean }> {
  try {
    const res = await fetchWithTimeout("/api/db/follows", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
      timeoutMs: 8_000,
    });
    return (await res.json()) as { ok: boolean; pendingSetup?: boolean };
  } catch {
    return { ok: false };
  }
}

export async function fetchFollowList(wallet: string, type: "followers" | "following"): Promise<Array<{ wallet: string; username: string; tier: string }>> {
  try {
    const res = await fetchWithTimeout(`/api/db/follows?wallet=${wallet}&type=${type}`, { timeoutMs: 8_000 });
    const data = (await res.json()) as { ok?: boolean; users?: Array<{ wallet: string; username: string; tier: string }> };
    if (!data.ok || !data.users) return [];
    return data.users;
  } catch {
    return [];
  }
}
