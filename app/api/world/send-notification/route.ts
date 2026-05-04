import { NextRequest } from "next/server";
import {
  isRateLimited,
  isSafeMiniAppPath,
  isWalletAddress,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "send-notification", 10)) {
    return rateLimitResponse();
  }

  const body = await readJsonBody<{
    walletAddresses?: string[];
    title?: string;
    message?: string;
    path?: string;
  }>(req);

  if (!body) {
    return noStoreJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { walletAddresses, title, message, path } = body;

  if (
    !walletAddresses?.length ||
    walletAddresses.length > 100 ||
    walletAddresses.some((address) => !isWalletAddress(address)) ||
    !title ||
    title.length > 45 ||
    !message ||
    message.length > 140 ||
    !path ||
    !isSafeMiniAppPath(path)
  ) {
    return noStoreJson(
      { error: "Missing notification data." },
      { status: 400 },
    );
  }

  if (!process.env.APP_ID || !process.env.DEV_PORTAL_API_KEY) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      message:
        "Add APP_ID and DEV_PORTAL_API_KEY before sending World notifications.",
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
        app_id: process.env.APP_ID,
        wallet_addresses: walletAddresses,
        title,
        message,
        mini_app_path: `worldapp://mini-app?app_id=${process.env.APP_ID}&path=${path}`,
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
