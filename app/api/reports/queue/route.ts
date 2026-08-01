import { noStoreJson } from "@/lib/serverApi";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, answers } = body ?? {};
    if (!question) return noStoreJson({ ok: false, error: "missing question" }, { status: 400 });

    // TODO: push to a real queue (Supabase table or Upstash Redis list) for human reviewers.
    // This stub only acknowledges the request so the client can show a "queued" state.
    return noStoreJson({ ok: true, queued: true });
  } catch (err) {
    return noStoreJson({ ok: false, error: "invalid request" }, { status: 400 });
  }
}
