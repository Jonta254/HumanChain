import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

// Client-side blocking utilities. Not wired into any feed yet — ready to
// activate the moment Supabase is provisioned (see /api/db/blocks), so
// there's no future rework needed once the backend goes live. Every
// function fails soft (empty list / no-op) rather than throwing, matching
// the rest of this app's local-first-with-optional-sync pattern.

export async function loadBlockedWallets(): Promise<string[]> {
  try {
    const res = await fetchWithTimeout("/api/db/blocks", { timeoutMs: 8_000 });
    const data = (await res.json()) as { ok?: boolean; blocks?: Array<{ blocked_wallet: string }> };
    if (!data.ok || !data.blocks) return [];
    return data.blocks.map((b) => b.blocked_wallet);
  } catch {
    return [];
  }
}

export async function blockWallet(blockedWallet: string): Promise<{ ok: boolean; pendingSetup?: boolean }> {
  try {
    const res = await fetchWithTimeout("/api/db/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked_wallet: blockedWallet }),
      timeoutMs: 8_000,
    });
    return (await res.json()) as { ok: boolean; pendingSetup?: boolean };
  } catch {
    return { ok: false };
  }
}

export async function unblockWallet(blockedWallet: string): Promise<{ ok: boolean; pendingSetup?: boolean }> {
  try {
    const res = await fetchWithTimeout("/api/db/blocks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked_wallet: blockedWallet }),
      timeoutMs: 8_000,
    });
    return (await res.json()) as { ok: boolean; pendingSetup?: boolean };
  } catch {
    return { ok: false };
  }
}

/** Filters any feed of items carrying an author wallet against a blocked-wallet set. */
export function excludeBlocked<T>(items: T[], authorWallet: (item: T) => string | undefined, blocked: Set<string>): T[] {
  if (blocked.size === 0) return items;
  return items.filter((item) => {
    const wallet = authorWallet(item);
    return !wallet || !blocked.has(wallet.toLowerCase());
  });
}
