import { NextRequest, NextResponse } from "next/server";

function signToken(secret: string, expiresInSeconds = 8 * 3600) {
  const crypto = require("crypto");
  const payload = JSON.stringify({ iat: Date.now(), exp: Date.now() + expiresInSeconds * 1000 });
  const b64 = Buffer.from(payload).toString("base64url");
  const hmac = crypto.createHmac("sha256", secret).update(b64).digest("hex");
  return `${b64}.${hmac}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = body?.password;
  const ADMIN_UI_PASSWORD = process.env.ADMIN_UI_PASSWORD;
  const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

  if (!ADMIN_UI_PASSWORD || !ADMIN_SESSION_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: "Admin UI not configured on server." }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  if (!password || password !== ADMIN_UI_PASSWORD) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const token = signToken(ADMIN_SESSION_SECRET);
  const maxAge = 8 * 3600; // 8 hours
  const cookie = `admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}; Secure`;

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", "Set-Cookie": cookie } });
}
