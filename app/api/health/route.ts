import { noStoreJson } from "@/lib/serverApi";
import { getWorldAppId } from "@/lib/worldConfig";

export function GET() {
  return noStoreJson({
    ok: true,
    app: "HumanChain",
    worldAppReady: Boolean(getWorldAppId()),
    checkedAt: new Date().toISOString(),
  });
}
