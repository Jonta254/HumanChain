"use client";

// Re-exports from lib/world/* — import directly from those modules in new code.
export {
  authenticateHumanWallet,
  chatWithWorld,
  getWorldMiniAppContext,
  getWorldPermissions,
  getWorldUserByAddress,
  humanHaptic,
  isWorldMiniAppReady,
  normalizeWorldUserProfile,
  payWithWorld,
  requestWorldPermission,
  Permission,
  readMiniKitValue,
  shareWithWorld,
} from "./world";
export type {
  WorldChatInput,
  WorldMiniAppContext,
  WorldPaymentConfirmation,
  WorldPaymentInput,
  WorldPermissionSnapshot,
  WorldShareInput,
  WorldUserProfile,
} from "./world";
