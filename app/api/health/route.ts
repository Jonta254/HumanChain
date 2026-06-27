import { list } from "@vercel/blob";
import { noStoreJson } from "@/lib/serverApi";
import {
  getHumanChainTreasury,
  getWorldAppId,
  getWorldDevPortalApiKey,
  getWorldRpId,
  getWorldRpSigningKey,
} from "@/lib/worldConfig";

export async function GET() {
  const worldAppId = getWorldAppId();
  const treasury = getHumanChainTreasury();
  const devPortalApiKey = getWorldDevPortalApiKey();
  const worldRpId = getWorldRpId();
  const worldRpSigningKey = getWorldRpSigningKey();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const supabaseReady = Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const aiReady = Boolean(process.env.ANTHROPIC_API_KEY);
  const cronReady = Boolean(process.env.CRON_SECRET);
  const pulseTreasuryReady = Boolean(process.env.NEXT_PUBLIC_PULSE_TREASURY);
  let blobStorageReady = false;
  let blobStorageStatus = process.env.BLOB_READ_WRITE_TOKEN
    ? "Cloud storage check running."
    : "Cloud storage is not connected yet.";

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await list({ limit: 1 });
      blobStorageReady = true;
      blobStorageStatus = "Vercel Blob store connected.";
    } catch {
      blobStorageStatus = "Cloud storage check failed.";
    }
  }

  return noStoreJson({
    ok: true,
    app: "HumanChain",
    accountSyncReady: blobStorageReady,
    aiReady,
    appUrlReady: Boolean(appUrl),
    blobStorageReady,
    blobStorageStatus,
    cronReady,
    env: {
      anthropicApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
      appId: Boolean(process.env.APP_ID),
      cronSecret: Boolean(process.env.CRON_SECRET),
      devPortalApiKey: Boolean(devPortalApiKey),
      nextPublicAppUrl: Boolean(appUrl),
      nextPublicPulseTreasury: pulseTreasuryReady,
      nextPublicWorldAppId: Boolean(process.env.NEXT_PUBLIC_WORLD_APP_ID),
      rpSigningKey: Boolean(worldRpSigningKey),
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      supabaseUrl: Boolean(process.env.SUPABASE_URL),
      worldRpId: Boolean(worldRpId),
    },
    paymentConfirmationReady: Boolean(worldAppId && devPortalApiKey),
    paymentsReady: Boolean(treasury && worldAppId && devPortalApiKey),
    pulseTreasuryReady,
    supabaseReady,
    treasury,
    worldAppId,
    worldAppReady: Boolean(worldAppId),
    worldIdReady: Boolean(worldRpId && worldRpSigningKey),
    checkedAt: new Date().toISOString(),
  });
}
