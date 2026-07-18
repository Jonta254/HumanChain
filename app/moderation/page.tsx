"use client";

import { useState } from "react";

type Report = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  reporter_wallet: string | null;
  created_at: string;
};

// Founder-only report queue. No real admin/role system exists yet (see the
// network-readiness memo) — this is gated behind a shared secret rather than
// real auth, deliberately minimal, and meant to be replaced once moderation
// outgrows one person reviewing manually. View-only: resolving a report
// still happens by acting on the underlying content directly for now.
export default function ModerationPage() {
  const [secret, setSecret] = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("hc_mod_secret") ?? ""));
  const [reports, setReports] = useState<Report[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "pending-setup" | "unauthorized">("idle");

  async function loadReports(withSecret: string) {
    setStatus("loading");
    try {
      const res = await fetch("/api/db/reports", { headers: { "x-moderation-secret": withSecret } });
      if (res.status === 401) { setStatus("unauthorized"); return; }
      const data = (await res.json()) as { ok?: boolean; pendingSetup?: boolean; reports?: Report[] };
      if (data.pendingSetup) { setStatus("pending-setup"); return; }
      if (!data.ok) { setStatus("error"); return; }
      sessionStorage.setItem("hc_mod_secret", withSecret);
      setReports(data.reports ?? []);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif", lineHeight: 1.6, color: "#181f1d" }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 4 }}>Moderation queue</h1>
      <p style={{ fontSize: "0.82rem", color: "#5d6b66", marginBottom: 24 }}>
        Founder-only, secret-gated. Real role-based access should replace this once more than one person moderates.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); void loadReports(secret); }}
        style={{ display: "flex", gap: 8, marginBottom: 24 }}
      >
        <input
          aria-label="Moderation secret"
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Moderation secret"
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ccd3cf" }}
          type="password"
          value={secret}
        />
        <button
          disabled={!secret || status === "loading"}
          style={{ padding: "8px 16px", borderRadius: 8, border: 0, background: "#0d7a86", color: "#fff", fontWeight: 700 }}
          type="submit"
        >
          {status === "loading" ? "Loading…" : "Load reports"}
        </button>
      </form>

      {status === "unauthorized" && <p style={{ color: "#a32d2d" }}>Wrong secret.</p>}
      {status === "pending-setup" && (
        <p style={{ color: "#8a5a0c" }}>
          MODERATION_SECRET or Supabase isn&apos;t configured yet. Set both in Vercel before this page can show real reports.
        </p>
      )}
      {status === "error" && <p style={{ color: "#a32d2d" }}>Couldn&apos;t load reports. Try again.</p>}

      {reports && reports.length === 0 && (
        <p style={{ color: "#5d6b66" }}>No reports yet — nothing to review.</p>
      )}

      {reports && reports.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccd3cf" }}>
              <th style={{ padding: "6px 8px 6px 0" }}>When</th>
              <th style={{ padding: "6px 8px" }}>Target</th>
              <th style={{ padding: "6px 8px" }}>Reason</th>
              <th style={{ padding: "6px 8px" }}>Reporter</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #e4ebe8" }}>
                <td style={{ padding: "8px 8px 8px 0", whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleString()}</td>
                <td style={{ padding: "8px" }}>{r.target_type} · {r.target_id}</td>
                <td style={{ padding: "8px", fontWeight: 700 }}>{r.reason}</td>
                <td style={{ padding: "8px", color: "#5d6b66" }}>{r.reporter_wallet ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
