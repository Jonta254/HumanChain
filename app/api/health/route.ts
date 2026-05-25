import { noStoreJson } from "@/lib/serverApi";
import { getHumanChainTreasury, getWorldAppId } from "@/lib/worldConfig";

export function GET() {
  const worldAppId = getWorldAppId();
  const treasury = getHumanChainTreasury();

  return noStoreJson({
    ok: true,
    app: "HumanChain",
    blobStorageReady: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    paymentsReady: Boolean(treasury),
    treasury,
    worldAppId,
    worldAppReady: Boolean(worldAppId),
    checkedAt: new Date().toISOString(),
  });
}
