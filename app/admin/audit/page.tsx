import React from "react";
import { extractAdminTokenFromCookie, validateAdminToken } from "@/lib/admin/session";

// Server component: audit UI for admin actions with pagination & filters. Requires admin_session cookie.

type SearchParams = { [key: string]: string | string[] | undefined };

function buildQuery(params: Record<string, any>) {
  const parts: string[] = [];
  for (const k of Object.keys(params)) {
    const v = params[k];
    if (v === undefined || v === null || v === "") continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

export default async function Page({ searchParams }: { searchParams?: SearchParams }) {
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

  // parse filters & pagination from searchParams
  const params = (searchParams ?? {}) as Record<string, any>;
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = Math.min(200, Math.max(10, Number(params.pageSize ?? 50)));
  const action = params.action ? String(params.action) : undefined;
  const actor = params.actor ? String(params.actor) : undefined;
  const report_id = params.report_id ? String(params.report_id) : undefined;
  const date_from = params.date_from ? String(params.date_from) : undefined;
  const date_to = params.date_to ? String(params.date_to) : undefined;

  const offset = (page - 1) * pageSize;
  const rangeFrom = offset;
  const rangeTo = offset + pageSize - 1;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Build query with filters
  let query = supabase
    .from("admin_audit")
    .select("id, action, report_id, actor, ip, details, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeFrom, rangeTo);

  if (action) query = query.eq("action", action);
  if (actor) query = query.ilike("actor", `%${actor}%`);
  if (report_id) query = query.eq("report_id", report_id);
  if (date_from) query = query.gte("created_at", date_from);
  if (date_to) query = query.lte("created_at", date_to);

  const { data: audits, error, count } = await query;
  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin Audit</h1>
        <p style={{ color: "#a00" }}>Error fetching audit logs: {error.message}</p>
      </main>
    );
  }

  const total = typeof count === "number" ? count : (audits ? audits.length : 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const baseParams = { pageSize, action: action ?? "", actor: actor ?? "", report_id: report_id ?? "", date_from: date_from ?? "", date_to: date_to ?? "" };

  return (
    <main style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Admin Audit</h1>
      <p style={{ color: "#444" }}>Recent administrative actions. This view requires an admin session.</p>

      <section style={{ marginTop: 12, marginBottom: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <form method="get" action="/admin/audit" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input type="text" name="action" placeholder="Action (exact)" defaultValue={action ?? ""} style={{ padding: 8 }} />
          <input type="text" name="actor" placeholder="Actor (partial)" defaultValue={actor ?? ""} style={{ padding: 8 }} />
          <input type="text" name="report_id" placeholder="Report ID (exact)" defaultValue={report_id ?? ""} style={{ padding: 8 }} />
          <input type="date" name="date_from" placeholder="From" defaultValue={date_from ?? ""} style={{ padding: 8 }} />
          <input type="date" name="date_to" placeholder="To" defaultValue={date_to ?? ""} style={{ padding: 8 }} />
          <input type="number" name="pageSize" placeholder="Page size" defaultValue={String(pageSize)} min={10} max={200} style={{ width: 120, padding: 8 }} />
          <button type="submit" style={{ padding: "8px 12px", background: "#137a57", color: "white", border: "none", borderRadius: 6 }}>Apply</button>
          <a href="/admin/audit" style={{ alignSelf: "center", color: "#666", marginLeft: 8 }}>Clear</a>
        </form>
      </section>

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
              <tr><td colSpan={6} style={{ padding: 12 }}>No audit logs available for the selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#666" }}>Showing page {page} of {totalPages} — {total} rows</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {page > 1 ? (
            <a href={`/admin/audit${buildQuery({ ...baseParams, page: page - 1 })}`} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6 }}>Prev</a>
          ) : (
            <span style={{ padding: "6px 10px", color: "#999", borderRadius: 6 }}>Prev</span>
          )}

          {Array.from({ length: Math.min(7, totalPages) }).map((_, idx) => {
            // center page numbers around current page
            const half = Math.floor(Math.min(7, totalPages) / 2);
            let start = Math.max(1, page - half);
            let end = Math.min(totalPages, start + Math.min(7, totalPages) - 1);
            if (end - start + 1 < Math.min(7, totalPages)) start = Math.max(1, end - Math.min(7, totalPages) + 1);
            const p = start + idx;
            if (p > end) return null;
            return p === page ? (
              <span key={p} style={{ padding: "6px 10px", background: "#137a57", color: "white", borderRadius: 6 }}>{p}</span>
            ) : (
              <a key={p} href={`/admin/audit${buildQuery({ ...baseParams, page: p })}`} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6 }}>{p}</a>
            );
          })}

          {page < totalPages ? (
            <a href={`/admin/audit${buildQuery({ ...baseParams, page: page + 1 })}`} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6 }}>Next</a>
          ) : (
            <span style={{ padding: "6px 10px", color: "#999", borderRadius: 6 }}>Next</span>
          )}
        </div>
      </div>

      <div style={{ marginTop: 18, color: "#666", fontSize: 13 }}>
        <p>Export: You can copy/paste this page or use the Supabase SQL editor to export audit rows as needed.</p>
      </div>
    </main>
  );
}
