// One-shot deep-link signal into the Market tab. Home CTAs set an intent
// right before switching tabs; MarketplaceView consumes it on first render
// to open the right sub-view (Services tab or the Sell flow).

export type MarketIntent = "market" | "services" | "sell" | null;

let pendingIntent: MarketIntent = null;

export function setMarketIntent(intent: Exclude<MarketIntent, null>) {
  pendingIntent = intent;
}

export function consumeMarketIntent(): MarketIntent {
  const intent = pendingIntent;
  pendingIntent = null;
  return intent;
}
