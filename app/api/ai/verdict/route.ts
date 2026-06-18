import { NextRequest } from "next/server";
import { isRateLimited, noStoreJson, rateLimitResponse, readJsonBody } from "@/lib/serverApi";

type VerdictRequest = {
  question: string;
  answers: Array<{ text: string; country?: string }>;
  feature?: string;
};

export type VerdictResult = {
  mostSaid: string;
  bestAnswer: string;
  hardTruth: string;
  finalVerdict: string;
};

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "ai-verdict", 5)) return rateLimitResponse();

  const body = await readJsonBody<VerdictRequest>(req);
  if (!body?.question || !Array.isArray(body.answers) || body.answers.length === 0) {
    return noStoreJson({ error: "Provide a question and at least one answer." }, { status: 400 });
  }

  const { question, answers } = body;
  const capped = answers.slice(0, 30);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return noStoreJson({ ok: false, pendingSetup: true }, { status: 503 });
  }

  const prompt = `You are analyzing responses to a question asked to verified humans on HumanChain.

Question: "${question}"

${capped.length} response${capped.length === 1 ? "" : "s"}:
${capped.map((a, i) => `${i + 1}. [${a.country ?? "World"}] ${a.text}`).join("\n")}

Generate a verdict grounded in what the humans actually said.

Respond ONLY with valid JSON, no markdown:
{"mostSaid":"...","bestAnswer":"...","hardTruth":"...","finalVerdict":"..."}

- mostSaid: common theme across most answers (1-2 sentences)
- bestAnswer: most insightful answer, quote or paraphrase (1-2 sentences)
- hardTruth: an uncomfortable truth the answers reveal (1-2 sentences)
- finalVerdict: definitive conclusion based on the full picture (2-3 sentences)`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error("[ai-verdict] Anthropic error", res.status);
      return noStoreJson({ ok: false, error: "AI verdict temporarily unavailable." }, { status: 502 });
    }

    const data = (await res.json()) as { content: Array<{ type: string; text: string }> };
    const text = data.content.find((c) => c.type === "text")?.text ?? "";
    const verdict = JSON.parse(text) as VerdictResult;

    if (!verdict.mostSaid || !verdict.bestAnswer || !verdict.hardTruth || !verdict.finalVerdict) {
      throw new Error("Incomplete verdict");
    }

    return noStoreJson({ ok: true, verdict });
  } catch (err) {
    console.error("[ai-verdict] error", err);
    return noStoreJson({ ok: false, error: "Could not generate verdict. Try again." }, { status: 500 });
  }
}
