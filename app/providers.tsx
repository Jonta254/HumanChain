"use client";

import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { I18nProvider } from "@worldcoin/mini-apps-ui-kit-react";
import { getWorldAppId } from "@/lib/worldConfig";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniKitProvider props={{ appId: getWorldAppId() }}>
      <I18nProvider>
        {children}
      </I18nProvider>
    </MiniKitProvider>
  );
}
