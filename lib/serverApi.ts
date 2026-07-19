import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "./kv";
import { verifySessionCookie } from "./session";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function noStoreJson(
  body: unknown,
  init?: ResponseInit,
) {
  const response = NextResponse.json(body, init);

  response.headers.set("Cache-Control", "no-store, max-age=0");

  return response;
}

export async function readJsonBody<T>(req: NextRequest) {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function isRateLimited(
  req: NextRequest,
  key: string,
  limit = 30,
  windowMs = 60_000,
) {
  const now = Date.now();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const bucketKey = `${key}:${ip}`;
  const bucket = rateLimitBuckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(bucketKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return false;
  }

  bucket.count += 1;

  return bucket.count > limit;
}

export function rateLimitResponse() {
  const response = noStoreJson(
    { error: "Too many requests. Please try again shortly." },
    { status: 429 },
  );

  response.headers.set("Retry-After", "60");

  return response;
}

/** Distributed rate limit via KV. Use for critical endpoints (payments, proofs). */
export async function isRateLimitedKV(
  req: NextRequest,
  key: string,
  limit = 20,
  windowSeconds = 60,
): Promise<boolean> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const window = Math.floor(Date.now() / (windowSeconds * 1000));
  const kvKey = `rl:${key}:${ip}:${window}`;
  const current = parseInt((await kvGet(kvKey)) ?? "0", 10);
  if (current >= limit) return true;
  await kvSet(kvKey, String(current + 1), windowSeconds);
  return false;
}

const SAFE_PATH_RE = /^\/[a-zA-Z0-9\-_/?=&#%.]*$/;
const ALLOWED_MINI_APP_PATHS = new Set(["/", "/ask", "/chains", "/stories", "/market", "/me", "/create", "/settings", "/culture"]);

export function isSafeMiniAppPath(path: string): boolean {
  if (!path || path.length > 200) return false;
  if (!SAFE_PATH_RE.test(path)) return false;
  if (path.includes("..")) return false;
  // Validate base path against known app sections
  const base = path.split("?")[0].split("#")[0];
  return ALLOWED_MINI_APP_PATHS.has(base);
}

export { isWalletAddress } from "./session";

/** Returns the verified wallet from the session cookie, or null if unauthenticated.
 * See lib/session.ts — this now requires a valid HMAC signature, not just a
 * correctly-formatted address, to close a session-forgery gap found in
 * production testing. */
export function getSessionWallet(req: NextRequest): string | null {
  return verifySessionCookie(req.cookies.get("humanchain_wallet")?.value);
}
