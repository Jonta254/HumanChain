import { noStoreJson } from "@/lib/serverApi";

// Unauthenticated on purpose — returns only a boolean, never the key itself.
// Lets the client show an honest "AI setup pending" state instead of letting
// a user pay for a feature (/api/ai/verdict) that's guaranteed to fail.
export async function GET() {
  return noStoreJson({ available: Boolean(process.env.ANTHROPIC_API_KEY) });
}
