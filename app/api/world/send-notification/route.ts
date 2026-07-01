import { NextRequest } from "next/server";
import {
  getSessionWallet,
  isRateLimitedKV,
  isSafeMiniAppPath,
  isWalletAddress,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";
import { getWorldAppId, getWorldDevPortalApiKey } from "@/lib/worldConfig";

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "send-notification", 10)) {
    return rateLimitResponse();
  }

  if (!getSessionWallet(req)) {
    return noStoreJson({ error: "Authentication required." }, { status: 401 });
  }

  const body = await readJsonBody<{
    localisations?: Array<{
      language: string;
      message: string;
      title: string;
    }>;
    sector?: string;
    walletAddresses?: string[];
    title?: string;
    message?: string;
    path?: string;
  }>(req);

  if (!body) {
    return noStoreJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { localisations, sector, walletAddresses, title, message, path } = body;
  const notificationTitle = title?.trim();
  const notificationMessage = message?.trim();
  const notificationPath = path?.trim() ?? "";
  const safeSectors = new Set([
    "inbox",
    "marketplace",
    "daily",
    "stories",
    "payments",
    "account",
  ]);
  const hasInvalidLocalisation = localisations?.some(
    (item) =>
      !item.language ||
      !item.title ||
      item.title.length > 30 ||
      !item.message ||
      item.message.length > 200,
  );

  if (
    !walletAddresses?.length ||
    walletAddresses.length > 1000 ||
    walletAddresses.some((address) => !isWalletAddress(address)) ||
    !notificationTitle ||
    notificationTitle.length > 30 ||
    !notificationMessage ||
    notificationMessage.length > 200 ||
    !path ||
    !isSafeMiniAppPath(notificationPath) ||
    (sector && !safeSectors.has(sector)) ||
    hasInvalidLocalisation
  ) {
    return noStoreJson(
      { error: "Missing notification data." },
      { status: 400 },
    );
  }

  const appId = getWorldAppId();
  const devPortalApiKey = getWorldDevPortalApiKey();

  if (!appId || !devPortalApiKey) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      message:
        "World notifications are being finalized. In-app activity still works.",
    }, { status: 503 });
  }

  const response = await fetch(
    "https://developer.worldcoin.org/api/v2/minikit/send-notification",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${devPortalApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: appId,
        wallet_addresses: walletAddresses,
        title: notificationTitle,
        message: notificationMessage,
        localisations,
        mini_app_path: `worldapp://mini-app?app_id=${appId}&path=${encodeURIComponent(notificationPath)}`,
      }),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    console.error("[send-notification] World API error:", response.status);
    return noStoreJson(
      { ok: false, error: "World notification request failed." },
      { status: 502 },
    );
  }

  return noStoreJson(payload);
}
