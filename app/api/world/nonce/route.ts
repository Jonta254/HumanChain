import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { isRateLimitedKV, noStoreJson, rateLimitResponse } from "@/lib/serverApi";

export async function GET(req: NextRequest) {
  if (await isRateLimitedKV(req, "siwe-nonce", 20)) return rateLimitResponse();

  const nonce = randomBytes(16).toString("hex");
  const response = noStoreJson({ nonce });

  response.cookies.set("humanchain_siwe_nonce", nonce, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: "/",
    sameSite: "strict",
    secure: true,
  });

  return response;
}
