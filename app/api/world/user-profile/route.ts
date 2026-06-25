import { NextRequest } from "next/server";
import {
  isRateLimitedKV,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";

type UsernameServiceProfile = {
  profile_picture_url?: string | null;
  username?: string | null;
};

function isEthAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "world-user-profile", 30)) {
    return rateLimitResponse();
  }

  const body = await readJsonBody<{ address?: string }>(req);
  const address = body?.address?.trim();

  if (!address || !isEthAddress(address)) {
    return noStoreJson({ error: "A valid World wallet address is required." }, { status: 400 });
  }

  const response = await fetch("https://usernames.worldcoin.org/api/v1/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ addresses: [address] }),
  });

  const profiles = (await response.json().catch(() => [])) as UsernameServiceProfile[];
  const profile = profiles[0];

  if (!response.ok) {
    return noStoreJson(
      { error: "World username lookup failed.", profiles },
      { status: 502 },
    );
  }

  return noStoreJson({
    profile: {
      profilePictureUrl: profile?.profile_picture_url ?? undefined,
      profile_picture_url: profile?.profile_picture_url ?? undefined,
      username: profile?.username ?? undefined,
      walletAddress: address,
      wallet_address: address,
    },
  });
}
