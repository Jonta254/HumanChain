import { noStoreJson } from "@/lib/serverApi";

export async function GET() {
  // Report feature is intentionally human-reviewed; LLM status not exposed publicly.
  return noStoreJson({ available: false });
}
