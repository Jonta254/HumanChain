import React from "react";

import { extractAdminTokenFromCookie } from "@/lib/admin/session";
import { createCsrfToken } from "@/lib/admin/csrf";

// Server component admin UI for processing queued Human Reports.
// Security: Admin users obtain an admin_session cookie by POSTing to /api/admin/login.
// This page server-renders a per-form CSRF token bound to the admin_session.

export default async function Page({}: {}) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin Reports</h1>
        <p style={{ color: "#a00" }}>
          Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment to use the admin UI.
        </p>
      </main>
    );
  }

  // Access the request's cookie header using Next.js server runtime global
  // (Edge runtime does not expose global request; Next server components can get cookies via headers())
  let rawCookie: string | undefined = undefined;
  try {
    // use the built-in headers() helper if available
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const headers = (globalThis as any).headers?.();
    rawCookie = headers?.get?.("cookie") ?? undefined;
  } catch (e) {
    rawCookie = undefined;
  }

  const sessionToken = extractAdminTokenFromCookie(rawCookie);
  const csrfToken = sessionToken ? createCsrfToken(sessionToken) : undefined;

  // Create Supabase client server-side
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: reports, error } = await supabase
    .from("reports")
    .select("id, question, answers, status, requested_by, created_at")
    .in("status", ["queued", "in_progress"])
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin Reports</h1>
        <p style={{ color: "#a00" }}>Error fetching reports: {error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>Queued Human Reports</h1>
      <p style={{ color: "#444" }}>This admin UI lets reviewers mark queued reports as ready. Keep ADMIN_UI_PASSWORD and Supabase service role key secret.</p>

      <div style={{ marginTop: 20 }}>
        {reports && reports.length > 0 ? (
          reports.map((r: any) => (
            <div key={r.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{r.question}</div>
              <div style={{ color: "#666", fontSize: 13, marginTop: 6 }}>
                Requested by: {r.requested_by ?? "unknown"} · {new Date(r.created_at).toLocaleString()}
              </div>
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: "pointer" }}>Answers (JSON)</summary>
                <pre style={{ maxHeight: 200, overflow: "auto", background: "#fafafa", padding: 8 }}>{JSON.stringify(r.answers, null, 2)}</pre>
              </details>

              <form
                // Server action: will call the server-side endpoint we already added (admin/complete)
                method="post"
                action={`/api/reports/admin/complete`}
                style={{ marginTop: 12 }}
              >
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="csrf_token" value={csrfToken ?? ""} />

                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Report result (JSON)</label>
                  <textarea name="result" rows={6} style={{ width: "100%", fontFamily: "monospace", fontSize: 13 }} placeholder='{"mostSaid":"...","bestAnswer":"...","hardTruth":"...","finalVerdict":"..."}' />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {sessionToken ? (
                    <button type="submit" style={{ background: "#137a57", color: "white", padding: "8px 12px", border: "none", borderRadius: 6 }}>Mark ready</button>
                  ) : (
                    <div style={{ color: "#a00" }}>You must sign in at /api/admin/login to mark reports ready.</div>
                  )}
                </div>
                <div style={{ marginTop: 8, color: "#888", fontSize: 12 }}>Submission will call the server admin-complete endpoint which requires an admin session cookie and a CSRF token.</div>
              </form>
            </div>
          ))
        ) : (
          <div style={{ padding: 12, background: "#f7fff7", border: "1px solid #e6f6ea", borderRadius: 8 }}>No queued reports at this time.</div>
        )}
      </div>

      <div style={{ marginTop: 24, color: "#666", fontSize: 13 }}>
        <h3 style={{ marginBottom: 8 }}>Notes</h3>
        <ul>
          <li>Admin UI uses the Supabase service role key on the server to read queued reports.</li>
          <li>Marking a report ready will call the server admin-complete endpoint which validates the admin_session cookie and the CSRF token rendered into this form.</li>
          <li>Do not expose ADMIN_UI_PASSWORD or ADMIN_API_KEY to browsers or public clients in production.</li>
        </ul>
      </div>
    </main>
  );
}
