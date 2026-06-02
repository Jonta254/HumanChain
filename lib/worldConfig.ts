export const defaultWorldAppId = "app_fd34958eed3f67a6710d76c46d261f77";
export const defaultWorldRpId = "rp_0717c6ad5e52999e";
export const defaultHumanChainTreasury =
  "0x6588e8765c495a9d44e93b0293aedd7ecd6167fc";

export function getWorldAppId() {
  return process.env.NEXT_PUBLIC_WORLD_APP_ID || process.env.APP_ID || defaultWorldAppId;
}

export function getWorldRpId() {
  return process.env.WORLD_RP_ID || defaultWorldRpId;
}

export function getHumanChainTreasury() {
  return process.env.NEXT_PUBLIC_HUMANCHAIN_TREASURY || defaultHumanChainTreasury;
}

export function getWorldDevPortalApiKey() {
  return (
    process.env.DEV_PORTAL_API_KEY ||
    process.env.WORLD_DEV_PORTAL_API_KEY ||
    process.env.MINIKIT_DEV_PORTAL_API_KEY ||
    ""
  );
}
