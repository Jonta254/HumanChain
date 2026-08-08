import crypto from "crypto";

export function validateAdminToken(token?: string): boolean {
  try {
    if (!token) return false;
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) return false;

    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [b64, mac] = parts;

    // Recompute HMAC
    const expected = crypto.createHmac("sha256", secret).update(b64).digest("hex");

    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(mac, "hex");
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;

    // decode payload (base64url)
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    const exp = Number(payload?.exp);
    if (!exp) return false;
    if (Date.now() > exp) return false;

    return true;
  } catch (err) {
    return false;
  }
}

export function extractAdminTokenFromCookie(cookieHeader?: string): string | undefined {
  if (!cookieHeader) return undefined;
  const m = cookieHeader.match(/(?:^|; )admin_session=([^;]+)/);
  if (!m) return undefined;
  return decodeURIComponent(m[1]);
}
