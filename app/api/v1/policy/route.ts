import { noStoreJson } from "@/lib/serverApi";
import { blockedListingTerms, humanChainErrorStates } from "@/lib/humanchainPolicy";

export async function GET() {
  return noStoreJson({
    ok: true,
    acceptance: {
      identity: "Public creation requires World wallet auth plus unique-human verification.",
      marketplace: "Listings require 3+ moderated photos, price, condition, area, and category checks.",
      moderation: "Every public surface must support report, block, strikes, support, and review queue states.",
      nav: ["Home", "Ask", "Moments", "Market", "Me"],
    },
    blockedListingTerms,
    endpointsPlanned: {
      identity: ["/v1/auth/nonce", "/v1/auth/wallet/complete", "/v1/auth/world-id/verify", "/v1/me"],
      marketplace: ["/v1/listings", "/v1/listings/:id/publish", "/v1/bids", "/v1/orders", "/v1/orders/:id/disputes"],
      moderation: ["/v1/reports", "/v1/blocks", "/v1/admin/moderation/queue"],
    },
    errorStates: humanChainErrorStates,
  });
}
