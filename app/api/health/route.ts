import { list } from "@vercel/blob";
import { noStoreJson } from "@/lib/serverApi";
import { getHumanChainTreasury, getWorldAppId } from "@/lib/worldConfig";

export async function GET() {
  const worldAppId = getWorldAppId();
  const treasury = getHumanChainTreasury();
  let blobStorageReady = false;
  let blobStorageStatus = process.env.BLOB_READ_WRITE_TOKEN
    ? "Blob token configured; checking store."
    : "BLOB_READ_WRITE_TOKEN is not configured.";

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await list({ limit: 1 });
      blobStorageReady = true;
      blobStorageStatus = "Vercel Blob store connected.";
    } catch (error) {
      blobStorageStatus =
        error instanceof Error
          ? error.message
          : "Vercel Blob store check failed.";
    }
  }

  return noStoreJson({
    ok: true,
    app: "HumanChain",
    accountSyncReady: blobStorageReady,
    blobStorageReady,
    blobStorageStatus,
    paymentsReady: Boolean(treasury),
    treasury,
    worldAppId,
    worldAppReady: Boolean(worldAppId),
    checkedAt: new Date().toISOString(),
  });
}
