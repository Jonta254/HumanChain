import React from "react";
import { extractAdminTokenFromCookie, validateAdminToken } from "@/lib/admin/session";

// Server component: audit UI for admin actions. Requires admin_session cookie.
// Shows recent rows from the admin_audit table in Supabase.

export default async function Page() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin Audit</h1>
        <p style={{ color: "#a00" }}>
          Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment to use the admin audit UI.
        </p>
      </main>
    );
  }

  // Read cookie from server runtime headers()
  let rawCookie: string | undefined = undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const headers = (globalThis as any).headers?.();
    rawCookie = headers?.get?.("cookie") ?? undefined;
  } catch (e) {
    rawCookie = undefined;
  }

  const sessionToken = extractAdminTokenFromCookie(rawCookie);
  if (!validateAdminToken(sessionToken)) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin Audit</h1>
        <p style={{ color: "#a00" }}>Unauthorized — please sign in at <code>/api/admin/login</code>.</p>
      </main>
    );
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: audits, error } = await supabase
    .from("admin_audit")
    .select("id, action, report_id, actor, ip, details, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin Audit</h1>
        <p style={{ color: "#a00" }}>Error fetching audit logs: {error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Admin Audit</h1>
      <p style={{ color: "#444" }}>Recent administrative actions. This view requires an admin session.</p>

      <div style={{ marginTop: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, system-ui, sans-serif" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
              <th style={{ padding: 8 }}>Time</th>
              <th style={{ padding: 8 }}>Action</th>
              <th style={{ padding: 8 }}>Report</th>
              <th style={{ padding: 8 }}>Actor</th>
              <th style={{ padding: 8 }}>IP</th>
              <th style={{ padding: 8 }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {audits && audits.length > 0 ? (
              audits.map((a: any) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #fafafa" }}>
                  <td style={{ padding: 8, verticalAlign: "top", width: 180 }}>{new Date(a.created_at).toLocaleString()}</td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>{a.action}</td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>{a.report_id ?? "—"}</td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>{a.actor ?? "admin"}</td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>{a.ip ?? "—"}</td>
                  <td style={{ padding: 8, verticalAlign: "top" }}><pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(a.details ?? {}, null, 2)}</pre></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} style={{ padding: 12 }}>No audit logs available.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 18, color: "#666", fontSize: 13 }}>
        <p>Export: You can copy/paste this page or use the Supabase SQL editor to export audit rows as needed.</p>
      </div>
    </main>
  );
}
