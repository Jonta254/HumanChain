"use client";

import React, { useEffect, useState } from "react";
import { loadJsonFromStorage, saveJsonToStorage, storageKeys } from "@/lib/humanchain/storage";

export default function AskView() {
  // Load legacy/unified unlocked reports set from localStorage
  const [unlockedReports, setUnlockedReports] = useState<Set<string>>(new Set());
  const [reportStatus, setReportStatus] = useState<Record<string, "queued" | "ready" | "none">>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const legacy = loadJsonFromStorage<string[]>(storageKeys.unlockedVerdicts as string, []);
      const current = loadJsonFromStorage<string[]>(storageKeys.unlockedReports as string, []);
      const merged = new Set<string>([...(legacy ?? []), ...(current ?? [])]);
      setUnlockedReports(merged);

      // initialize status map for merged questions
      const initialStatus: Record<string, "queued" | "ready" | "none"> = {};
      for (const q of merged) initialStatus[q] = "queued"; // assume queued until admin marks ready
      setReportStatus(initialStatus);
    } catch (e) {
      // ignore
    }
  }, []);

  function persistUnlockedReports(set: Set<string>) {
    try {
      saveJsonToStorage(storageKeys.unlockedReports as string, Array.from(set));
    } catch (e) {
      // ignore
    }
  }

  async function requestHumanReport(question: string, answers: Array<{ text: string; country?: string }>) {
    if (busy) return;
    setBusy(true);
    try {
      // Optimistically mark unlocked locally
      const next = new Set(unlockedReports);
      next.add(question);
      setUnlockedReports(next);
      persistUnlockedReports(next);
      setReportStatus((s) => ({ ...s, [question]: "queued" }));

      const res = await fetch("/api/reports/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answers }),
      });
      const data = await res.json();
      if (!data?.ok || !data?.queued) {
        // rollback
        const rollback = new Set(unlockedReports);
        rollback.delete(question);
        setUnlockedReports(rollback);
        persistUnlockedReports(rollback);
        setReportStatus((s) => ({ ...s, [question]: "none" }));
        alert("Could not queue human report. Please try again later.");
      } else {
        // queued successfully — UI already shows queued state
      }
    } catch (err) {
      const rollback = new Set(unlockedReports);
      rollback.delete(question);
      setUnlockedReports(rollback);
      persistUnlockedReports(rollback);
      setReportStatus((s) => ({ ...s, [question]: "none" }));
      alert("Could not queue human report. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  // For now show a small example UI. The full Ask flow integrates with thread state elsewhere.
  const sampleQuestion = "What's the best way to move abroad with a family?";
  const sampleAnswers = [
    { text: "Research visas early and budget for cost of living.", country: "US" },
    { text: "Talk to locals and get a job lined up before moving.", country: "UK" },
  ];

  const isUnlocked = unlockedReports.has(sampleQuestion);
  const status = reportStatus[sampleQuestion] ?? (isUnlocked ? "queued" : "none");

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Ask</h2>
      <p style={{ color: "#444", marginTop: 0 }}>{sampleQuestion}</p>

      <div style={{ marginTop: 12 }}>
        {status === "none" && (
          <button
            onClick={() => requestHumanReport(sampleQuestion, sampleAnswers)}
            disabled={busy}
            style={{ background: "#137a57", color: "white", padding: "10px 14px", border: "none", borderRadius: 8 }}
          >
            Request Human Report — 6 WLD
          </button>
        )}

        {status === "queued" && (
          <div style={{ padding: 12, background: "#fff9f0", border: "1px solid #f0e0d0", borderRadius: 8 }}>
            <strong>Report queued</strong>
            <div style={{ color: "#555" }}>A human reviewer will prepare the report and you'll be notified when it's ready.</div>
          </div>
        )}

        {status === "ready" && (
          <div style={{ padding: 12, background: "#f6fffa", border: "1px solid #dff5e8", borderRadius: 8 }}>
            <strong>Human Report</strong>
            <div style={{ color: "#333" }}>Report content is ready — open it to read the summary and reflections.</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, color: "#888", fontSize: 13 }}>
        This is a sandboxed Ask view for demoing the Human Report enqueue flow. The full Ask thread experience integrates elsewhere in the app.
      </div>
    </div>
  );
}
