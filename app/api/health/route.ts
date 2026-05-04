import { noStoreJson } from "@/lib/serverApi";

export function GET() {
  return noStoreJson({
    ok: true,
    app: "HumanChain",
    worldAppReady: Boolean(process.env.APP_ID),
    checkedAt: new Date().toISOString(),
  });
}
