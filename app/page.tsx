"use client";

import { useHumanChainApp } from "@/lib/humanchain/useHumanChainApp";
import { HumanChainRoot } from "@/components/layout/HumanChainRoot";

export default function HumanChainApp() {
  const app = useHumanChainApp();
  return <HumanChainRoot {...app} />;
}
