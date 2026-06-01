import { get, put } from "@vercel/blob";
import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import {
  isRateLimited,
  isWalletAddress,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";

type AccountSyncPayload = {
  action?: "load" | "save";
  snapshot?: unknown;
  wallet?: string;
};

function accountPath(wallet: string) {
  const walletHash = createHash("sha256").update(wallet.toLowerCase()).digest("hex");

  return `humanchain/accounts/${walletHash}/latest.json`;
}

async function readStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks).toString("utf8");
}

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "account-sync", 20)) {
    return rateLimitResponse();
  }

  const payload = await readJsonBody<AccountSyncPayload>(req);

  if (!payload?.wallet || !isWalletAddress(payload.wallet) || !payload.action) {
    return noStoreJson(
      { error: "Send a valid wallet and sync action." },
      { status: 400 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      message:
        "Account sync is being finalized. This device keeps your activity locally for now.",
    });
  }

  const pathname = accountPath(payload.wallet);

  if (payload.action === "load") {
    const result = await get(pathname, {
      access: "public",
      useCache: false,
    });

    if (!result?.stream || result.statusCode !== 200) {
      return noStoreJson({ ok: true, snapshot: null });
    }

    return noStoreJson({
      ok: true,
      snapshot: JSON.parse(await readStream(result.stream)),
      syncedAt: result.blob.uploadedAt,
    });
  }

  if (!payload.snapshot) {
    return noStoreJson(
      { error: "Send a snapshot to save." },
      { status: 400 },
    );
  }

  const savedAt = new Date().toISOString();
  const blob = await put(
    pathname,
    JSON.stringify(
      {
        savedAt,
        snapshot: payload.snapshot,
        wallet: payload.wallet.toLowerCase(),
      },
      null,
      2,
    ),
    {
      access: "public",
      allowOverwrite: true,
      contentType: "application/json",
    },
  );

  return noStoreJson({
    ok: true,
    savedAt,
    url: blob.url,
  });
}
