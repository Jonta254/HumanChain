import { NextRequest } from "next/server";
import { getSessionWallet, noStoreJson, readJsonBody } from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  if (!getSessionWallet(req)) {
    return noStoreJson({ error: "Authentication required." }, { status: 401 });
  }

  const body = await readJsonBody<{ question?: string }>(req);
  if (!body?.question) {
    return noStoreJson({ error: "Provide a question." }, { status: 400 });
  }

  // Intentionally do NOT call any LLM here.
  // Enqueueing is handled by the reports queue endpoint (/api/reports/queue) instead.
  return noStoreJson({ ok: false, pendingSetup: true }, { status: 503 });
}
