import { NextRequest } from "next/server";
import { noStoreJson, readJsonBody } from "@/lib/serverApi";
import {
  validateAnswerInput,
  validateListingInput,
  validateQuestionInput,
} from "@/lib/humanchainPolicy";

type ValidatePayload = {
  body?: string;
  category?: string;
  kind?: "answer" | "listing" | "question";
  listing?: Parameters<typeof validateListingInput>[0];
  route?: string;
  title?: string;
};

export async function POST(req: NextRequest) {
  const payload = await readJsonBody<ValidatePayload>(req);

  if (payload?.kind === "question") {
    return noStoreJson(validateQuestionInput(payload.title ?? "", payload.body ?? "", payload.category, payload.route));
  }

  if (payload?.kind === "answer") {
    return noStoreJson(validateAnswerInput(payload.body ?? ""));
  }

  if (payload?.kind === "listing") {
    return noStoreJson(validateListingInput(payload.listing ?? {}));
  }

  return noStoreJson({ error: "Send kind: question, answer, or listing." }, { status: 400 });
}
