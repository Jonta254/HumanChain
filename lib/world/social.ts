"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import type { WorldChatInput, WorldShareInput } from "./types";

export async function shareWithWorld({ text, title, url }: WorldShareInput) {
  return MiniKit.share({
    text,
    title,
    url,
    fallback: async () => {
      if (navigator.share) {
        await navigator.share({ text, title, url });
      }

      return {
        shared_files_count: 0,
        status: "success",
        version: 1,
        timestamp: new Date().toISOString(),
      };
    },
  });
}

export async function chatWithWorld({ message, to }: WorldChatInput) {
  return MiniKit.chat({
    message,
    to,
    fallback: () => ({
      count: to?.length ?? 1,
      status: "success",
      version: 1,
      timestamp: new Date().toISOString(),
    }),
  });
}
