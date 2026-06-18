import { NextRequest } from "next/server";
import { isRateLimitedKV, noStoreJson, rateLimitResponse, readJsonBody } from "@/lib/serverApi";

type VerdictRequest = {
  question: string;
  answers: Array<{ text: string; country?: string }>;
  feature?: string;
  storyTitle?: string;
};

export type VerdictResult = {
  mostSaid: string;
  bestAnswer: string;
  hardTruth: string;
  finalVerdict: string;
};

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "ai-verdict", 5)) return rateLimitResponse();

  const body = await readJsonBody<VerdictRequest>(req);
  if (!body?.question || !Array.isArray(body.answers) || body.answers.length === 0) {
    return noStoreJson({ error: "Provide a question and at least one answer." }, { status: 400 });
  }

  const { question, answers, feature, storyTitle } = body;
  const capped = answers.slice(0, 30);
  const isReflection = feature === "deep-story-reflection";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return noStoreJson({ ok: false, pendingSetup: true }, { status: 503 });
  }

  const prompt = isReflection
    ? `You are a thoughtful guide helping a reader reflect on a story they just paid to experience on HumanChain.

Story: "${storyTitle ?? question}"

Generate a personal reflection guide with exactly these 4 fields.
Respond ONLY with valid JSON, no markdown:
{"mostSaid":"...","bestAnswer":"...","hardTruth":"...","finalVerdict":"..."}

- mostSaid: the core theme or message of this story (1-2 sentences)
- bestAnswer: the most memorable idea or moment from the story (1-2 sentences)
- hardTruth: what this story challenges the reader to confront (1-2 sentences)
- finalVerdict: a personal reflection prompt — a question for the reader to sit with (1-2 sentences)`
    : `You are analyzing responses to a question asked to verified humans on HumanChain.

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
