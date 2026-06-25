export default function Loading() {
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
        gap: "20px",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0 8px 28px rgba(19,122,87,0.22)",
        }}
      >
        <img
          alt="HumanChain"
          src="/images/humanchain-logo.png"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 17,
            fontWeight: 850,
            color: "#15201c",
            letterSpacing: "-0.01em",
          }}
        >
          HumanChain
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#5d6b66",
          }}
        >
          Verified humans only
        </span>
      </div>
      <div
        style={{
          width: 36,
          height: 4,
          borderRadius: 999,
          background: "rgba(19,122,87,0.15)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#137a57",
            borderRadius: 999,
            animation: "hc-load-bar 1.2s ease-in-out infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes hc-load-bar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
