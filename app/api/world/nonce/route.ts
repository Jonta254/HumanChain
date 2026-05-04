import { randomBytes } from "crypto";
import { noStoreJson } from "@/lib/serverApi";

export async function GET() {
  const nonce = randomBytes(16).toString("hex");
  const response = noStoreJson({ nonce });

  response.cookies.set("humanchain_siwe_nonce", nonce, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
