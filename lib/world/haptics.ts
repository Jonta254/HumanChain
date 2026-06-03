"use client";

import { MiniKit } from "@worldcoin/minikit-js";

export async function humanHaptic(style: "light" | "medium" | "heavy" = "light") {
  return MiniKit.sendHapticFeedback({
    hapticsType: "impact",
    style,
    fallback: () => {
      navigator.vibrate?.(style === "heavy" ? 45 : 20);
      return {
        status: "success",
        version: 1,
        timestamp: new Date().toISOString(),
      };
    },
  });
}
