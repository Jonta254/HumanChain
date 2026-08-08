import crypto from "crypto";

// CSRF tokens bound to an admin session token (admin_session).
// The token is a base64url(payload) + "." + hmac, where payload includes a sid derived from the session token.
// This avoids any server-side storage while still binding the token to the session and allowing expiry checks.

function sidFromSession(sessionToken?: string) {
  if (!sessionToken) return null;
  return crypto.createHash("sha256").update(sessionToken).digest("hex");
}

export function createCsrfToken(sessionToken?: string, expiresInSeconds = 60 * 60) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !sessionToken) return undefined;

  const sid = sidFromSession(sessionToken);
  const payload = JSON.stringify({ sid, iat: Date.now(), exp: Date.now() + expiresInSeconds * 1000, nonce: crypto.randomBytes(8).toString("hex") });
  const b64 = Buffer.from(payload).toString("base64url");
  const hmac = crypto.createHmac("sha256", secret).update(b64).digest("hex");
  return `${b64}.${hmac}`;
}

export function validateCsrfToken(token: string | undefined, sessionToken?: string) {
  try {
    if (!token || !sessionToken) return false;
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) return false;

    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [b64, mac] = parts;

    const expected = crypto.createHmac("sha256", secret).update(b64).digest("hex");

    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(mac, "hex");
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;

    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    const exp = Number(payload?.exp);
    const sid = payload?.sid;
    if (!exp || !sid) return false;
    if (Date.now() > exp) return false;

    const expectedSid = sidFromSession(sessionToken);
    if (!expectedSid) return false;
    if (expectedSid !== sid) return false;

    return true;
  } catch (err) {
    return false;
  }
}
