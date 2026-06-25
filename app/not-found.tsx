import Link from "next/link";

export default function NotFound() {
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
        Page not found
      </span>
      <Link
        href="/"
        style={{
          fontSize: 14,
          color: "#137a57",
          fontWeight: 600,
          textDecoration: "underline",
        }}
      >
        Return to HumanChain
      </Link>
    </div>
  );
}
