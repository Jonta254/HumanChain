import { put } from "@vercel/blob";
import { NextRequest } from "next/server";
import {
  isRateLimited,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";

const allowedKinds = new Set([
  "post",
  "marketplace-listing",
  "marketplace-bid",
  "story",
]);

type StorePayload = {
  data?: unknown;
  id?: number | string;
  kind?: string;
};

function safeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "record";
}

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "data-store", 45)) {
    return rateLimitResponse();
  }

  const payload = await readJsonBody<StorePayload>(req);

  if (!payload?.kind || !allowedKinds.has(payload.kind) || !payload.data) {
    return noStoreJson(
      { error: "Send a supported data kind and record payload." },
      { status: 400 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      message: "Add BLOB_READ_WRITE_TOKEN before durable data receipts.",
    });
  }

  const recordId = safeSegment(String(payload.id ?? Date.now()));
  const savedAt = new Date().toISOString();
  const body = JSON.stringify(
    {
      data: payload.data,
      id: payload.id ?? recordId,
      kind: payload.kind,
      savedAt,
    },
    null,
    2,
  );

  try {
    const blob = await put(
      `humanchain/data/${safeSegment(payload.kind)}/${recordId}-${Date.now()}.json`,
      body,
      {
        access: "public",
        addRandomSuffix: true,
        contentType: "application/json",
      },
    );

    return noStoreJson({
      ok: true,
      savedAt,
      url: blob.url,
    });
  } catch {
    return noStoreJson(
      { error: "Could not store this data receipt." },
      { status: 502 },
    );
  }
}
