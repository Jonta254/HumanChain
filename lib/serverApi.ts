import { NextRequest, NextResponse } from "next/server";

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
  return noStoreJson(
    { error: "Too many requests. Please try again shortly." },
    { status: 429 },
  );
}

export function isSafeMiniAppPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") && path.length <= 120;
}

export function isWalletAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
