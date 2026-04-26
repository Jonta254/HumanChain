import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { walletAddresses, title, message, path } = (await req.json()) as {
    walletAddresses?: string[];
    title?: string;
    message?: string;
    path?: string;
  };

  if (!walletAddresses?.length || !title || !message || !path) {
    return NextResponse.json(
      { error: "Missing notification data." },
      { status: 400 },
    );
  }

  if (!process.env.APP_ID || !process.env.DEV_PORTAL_API_KEY) {
    return NextResponse.json({
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

  return NextResponse.json(await response.json());
}
