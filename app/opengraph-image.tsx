import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "HumanChain — the verified-human network inside World App";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoBuffer = await readFile(
    join(process.cwd(), "public/world-assets/humanchain-profile-icon-1024.png")
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 70px",
          background:
            "linear-gradient(135deg, #0a2e24 0%, #0f4a3a 45%, #0f3a52 100%)",
          position: "relative",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: 260,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(214,163,58,0.28) 0%, rgba(214,163,58,0) 70%)",
            display: "flex",
          }}
        />

        {/* Left: icon mark */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 300,
          }}
        >
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 40,
              border: "1.5px solid rgba(214,163,58,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                width: 156,
                height: 156,
                borderRadius: "50%",
                border: "1.5px solid rgba(214,163,58,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 0 40px rgba(19,122,87,0.55)",
              }}
            >
              <img
                src={logoSrc}
                width={156}
                height={156}
                style={{ borderRadius: "50%" }}
                alt=""
              />
            </div>
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 4,
              color: "#eef4f1",
              display: "flex",
            }}
          >
            HUMANCHAIN
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#d6a33a",
              display: "flex",
            }}
          >
            WORLD ID VERIFIED
          </div>
        </div>

        {/* Right: content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingLeft: 60,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.02 }}>
            <span style={{ fontSize: 86, fontWeight: 800, color: "#ffffff", display: "flex" }}>
              HUMAN
            </span>
            <span style={{ fontSize: 86, fontWeight: 800, color: "#d6a33a", display: "flex" }}>
              CHAIN
            </span>
          </div>

          <div
            style={{
              marginTop: 22,
              width: 460,
              height: 2,
              background:
                "linear-gradient(90deg, rgba(214,163,58,0.9), rgba(214,163,58,0))",
              display: "flex",
            }}
          />

          <div style={{ marginTop: 22, fontSize: 26, fontWeight: 700, color: "#eef4f1", display: "flex" }}>
            Ask. Post. Trade. Read.
          </div>
          <div style={{ marginTop: 6, fontSize: 17, fontWeight: 500, color: "rgba(238,244,241,0.62)", display: "flex" }}>
            Real humans, verified by World ID.
          </div>

          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Daily questions — earn +18 HP per honest answer",
              "Trust-first marketplace with WLD payments",
              "Human Passport — live score, badges, and reputation",
            ].map((line) => (
              <div key={line} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d6a33a", display: "flex" }} />
                <span style={{ fontSize: 18, fontWeight: 500, color: "rgba(238,244,241,0.86)", display: "flex" }}>
                  {line}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 30, display: "flex", gap: 14 }}>
            {[
              ["No Bots", "EVER"],
              ["420 HP", "STARTER"],
              ["14", "LANGUAGES"],
            ].map(([top, bottom]) => (
              <div
                key={top}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "10px 22px",
                  borderRadius: 14,
                  border: "1px solid rgba(214,163,58,0.4)",
                  background: "rgba(214,163,58,0.08)",
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 800, color: "#eef4f1", display: "flex" }}>{top}</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "rgba(238,244,241,0.55)", display: "flex" }}>
                  {bottom}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            left: 70,
            right: 70,
            bottom: 30,
            display: "flex",
            justifyContent: "center",
            paddingTop: 16,
            borderTop: "1px solid rgba(238,244,241,0.14)",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, color: "rgba(238,244,241,0.5)", display: "flex" }}>
            WORLD APP MINI APP · WORLD ID REQUIRED · human-chain-gamma.vercel.app
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
