import { NextRequest } from "next/server";
import {
  isRateLimited,
  isSafeMiniAppPath,
  isWalletAddress,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";
import { getWorldAppId } from "@/lib/worldConfig";

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "send-notification", 10)) {
    return rateLimitResponse();
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

  if (!appId || !process.env.DEV_PORTAL_API_KEY) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      message:
        "Add DEV_PORTAL_API_KEY before sending World notifications.",
    });
  }

  const response = await fetch(
    "https://developer.worldcoin.org/api/v2/minikit/send-notification",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
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
    return noStoreJson(
      {
        ok: false,
        error: "World notification request failed.",
        payload,
      },
      { status: 502 },
    );
  }

  return noStoreJson(payload);
}
