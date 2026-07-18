import { BlobNotFoundError, get, put } from "@vercel/blob";
import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import {
  getSessionWallet,
  isRateLimitedKV,
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
  if (await isRateLimitedKV(req, "account-sync", 20)) {
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

  // Both load and save require the authenticated wallet to match.
  const sessionWallet = getSessionWallet(req);
  if (!sessionWallet || sessionWallet !== payload.wallet.toLowerCase()) {
    return noStoreJson({ error: "Unauthorized." }, { status: 403 });
  }

  if (payload.action === "load") {
    // get() throws BlobNotFoundError (not a graceful 404 result) when this
    // wallet has never saved a snapshot yet — the common case for any
    // first-time sync. Treat that as "no snapshot" rather than a failure.
    // Any other Blob error (seen in production as a bare "400 Bad Request",
    // a different exception class than BlobNotFoundError) was previously
    // rethrown uncaught, crashing this route for the user's whole session
    // restore. Never let a storage read take down account load — log it
    // server-side and degrade to "no snapshot" instead.
    let result: Awaited<ReturnType<typeof get>>;
    try {
      result = await get(pathname, {
        access: "public",
        useCache: false,
      });
    } catch (error) {
      if (error instanceof BlobNotFoundError) {
        return noStoreJson({ ok: true, snapshot: null });
      }
      console.error("[data/account] blob load error:", error instanceof Error ? error.message : error);
      return noStoreJson({ ok: true, snapshot: null, syncWarning: "Cloud snapshot temporarily unavailable." });
    }

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
  try {
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
  } catch (error) {
    console.error("[data/account] blob save error:", error instanceof Error ? error.message : error);
    return noStoreJson({ ok: false, pendingSetup: true, message: "Cloud save temporarily unavailable — kept locally." });
  }
}
