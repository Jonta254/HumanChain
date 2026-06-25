"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), 1500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #f7fbf9 0%, #eef4f1 100%)",
        gap: "16px",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <img
        alt="HumanChain"
        src="/images/humanchain-logo.png"
        style={{ width: 56, height: 56, borderRadius: 16, objectFit: "cover" }}
      />
      <span style={{ fontSize: 15, fontWeight: 800, color: "#15201c" }}>
        Returning to HumanChain…
      </span>
    </div>
  );
}
