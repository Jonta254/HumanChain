import { createHmac, timingSafeEqual } from "node:crypto";

// Single source of truth for session identity. Previously, two separate
// getSessionWallet() implementations (lib/serverApi.ts and
// lib/api/responses.ts) both trusted the raw `humanchain_wallet` cookie
// value at face value — any client sending
// `Cookie: humanchain_wallet=<any address>` directly to the API was treated
// as an authenticated session for that wallet, with zero proof they ever
// completed SIWE. httpOnly/secure/sameSite protect against browser-JS theft
// and cross-site forgery, but do nothing to stop a direct HTTP client from
// sending an arbitrary cookie header — confirmed exploitable against
// production with curl. Now the cookie value is `<wallet>.<hmac>`, signed
// server-side at issue (complete-siwe) and verified on every read; without
// the server's SESSION_SECRET an attacker cannot construct a valid mac.

export function isWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function sessionSecret(): string | null {
  return process.env.SESSION_SECRET || null;
}

/** Builds the signed cookie value for a wallet that has just completed real SIWE verification. */
export function signSessionCookie(wallet: string): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("SESSION_SECRET not configured");
  const normalized = wallet.toLowerCase();
  const mac = createHmac("sha256", secret).update(normalized).digest("hex");
  return `${normalized}.${mac}`;
}

/**
 * Verifies a session cookie value and returns the wallet it authenticates, or
 * null. Fails closed: a missing SESSION_SECRET, a malformed value, or a
 * pre-fix cookie (bare wallet address with no signature) all return null
 * rather than being trusted.
 */
export function verifySessionCookie(value: string | undefined | null): string | null {
  if (!value) return null;
  const secret = sessionSecret();
  if (!secret) return null;

  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;
  const wallet = value.slice(0, dot).toLowerCase();
  const mac = value.slice(dot + 1);
  if (!isWalletAddress(wallet) || !/^[0-9a-f]{64}$/.test(mac)) return null;

  const expected = createHmac("sha256", secret).update(wallet).digest("hex");
  const macBuf = Buffer.from(mac, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (macBuf.length !== expectedBuf.length || !timingSafeEqual(macBuf, expectedBuf)) return null;

  return wallet;
}
