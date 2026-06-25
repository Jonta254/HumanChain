export const defaultWorldAppId = "app_97e4c10f331dd72c24d29ba5f98e5bb7";
export const defaultWorldRpId = "rp_11af98b36fc272da";
export const defaultHumanChainTreasury =
  "0x6588e8765c495a9d44e93b0293aedd7ecd6167fc";

export function getWorldAppId() {
  return (
    process.env.NEXT_PUBLIC_WORLD_APP_ID ||
    // Common Vercel dashboard names
    process.env.WORLD_APP_ID ||
    process.env.NEW_WORLD_APP_ID ||
    process.env.APP_ID ||
    defaultWorldAppId
  );
}

export function getWorldRpId() {
  return process.env.WORLD_RP_ID || defaultWorldRpId;
}

export function getHumanChainTreasury() {
  return (
    process.env.NEXT_PUBLIC_HUMANCHAIN_TREASURY ||
    // Common Vercel dashboard names
    process.env.HUMANCHAIN_TREASURY_WALLET ||
    process.env.HUMANCHAIN_TREASURY ||
    process.env.TREASURY_WALLET ||
    defaultHumanChainTreasury
  );
}

export function getWorldDevPortalApiKey() {
  return (
    process.env.DEV_PORTAL_API_KEY ||
    process.env.WORLD_DEV_PORTAL_API_KEY ||
    process.env.MINIKIT_DEV_PORTAL_API_KEY ||
    ""
  );
}
