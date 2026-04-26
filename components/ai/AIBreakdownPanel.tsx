"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  type: string;
  title: string;
  body: string;
  is_accepted: boolean | null;
}

interface AIBreakdownPanelProps {
  projectId: string;
  suggestions: Suggestion[];
  backlogTaskIds: string[];
}

export default function AIBreakdownPanel({
  projectId,
  suggestions,
  backlogTaskIds,
}: AIBreakdownPanelProps) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);
  const [isRecommendLoading, setIsRecommendLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleBreakdown = async () => {
    if (description.trim().length < 10) return;
    setIsBreakdownLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, description: description.trim() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal generate");
      setStatus({ type: "success", msg: "Tasks berhasil dibuat dan ditambahkan ke Backlog!" });
      setDescription("");
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", msg: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setIsBreakdownLoading(false);
    }
  };

  const handleRecommend = async () => {
    if (backlogTaskIds.length === 0) {
      setStatus({ type: "error", msg: "Tidak ada task di Backlog untuk direkomendasikan." });
      return;
    }
    setIsRecommendLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, taskIds: backlogTaskIds }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal generate rekomendasi");
      setStatus({ type: "success", msg: "Rekomendasi penugasan berhasil dibuat!" });
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", msg: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setIsRecommendLoading(false);
    }
  };

  const pending = suggestions.filter((s) => s.is_accepted === null);

  return (
    <aside
      className="w-72 shrink-0 flex flex-col overflow-hidden"
      style={{
        background: "var(--c-surface)",
        borderLeft: "1px solid var(--c-border)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 shrink-0 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--c-border)" }}
      >
        <span
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold rounded px-2 py-1"
          style={{
            background: "var(--c-accent-bg)",
            color: "var(--c-accent)",
            border: "1px solid var(--c-accent-bd)",
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
            <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
          </svg>
          AI Assistant
        </span>
      </div>

      <div className="overflow-y-auto flex-1 flex flex-col">
        {/* Task Breakdown */}
        <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--c-border)" }}>
          <p className="text-xs font-bold mb-0.5" style={{ color: "var(--c-text)" }}>
            Task Breakdown
          </p>
          <p className="text-[11px] mb-3 leading-relaxed" style={{ color: "var(--c-muted)" }}>
            Deskripsikan fitur/modul, AI akan membuat sub-tasks otomatis.
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Buat fitur login dengan Google OAuth, session management, dan redirect ke dashboard..."
            rows={4}
            disabled={isBreakdownLoading}
            className="w-full rounded-lg p-2.5 text-xs placeholder-[var(--c-faint)] focus:outline-none transition-colors resize-none disabled:opacity-50 mb-2"
            style={{
              background: "var(--c-raised)",
              border: "1px solid var(--c-border)",
              color: "var(--c-text)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--c-border)")}
          />

          {status && (
            <div
              className="flex items-start gap-1.5 text-[11px] mb-2 px-2.5 py-2 rounded-lg"
              style={{
                color: status.type === "success" ? "var(--c-green)" : "var(--c-danger)",
                background: status.type === "success" ? "var(--c-green-bg)" : "var(--c-red-bg)",
                border: `1px solid ${status.type === "success" ? "var(--c-green)" : "var(--c-danger)"}22`,
              }}
            >
              {status.msg}
            </div>
          )}

          <button
            onClick={handleBreakdown}
            disabled={isBreakdownLoading || description.trim().length < 10}
            className="w-full text-xs font-bold py-2.5 rounded-lg transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: "var(--c-accent)",
              color: "var(--c-bg)",
            }}
          >
            {isBreakdownLoading ? (
              <>
                <span className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 8 8" fill="currentColor">
                  <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
                </svg>
                Generate Tasks
              </>
            )}
          </button>
        </div>

        {/* Recommend Members */}
        <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--c-border)" }}>
          <p className="text-xs font-bold mb-0.5" style={{ color: "var(--c-text)" }}>
            Rekomendasi Anggota
          </p>
          <p className="text-[11px] mb-3 leading-relaxed" style={{ color: "var(--c-muted)" }}>
            AI merekomendasikan siapa yang paling cocok untuk task di Backlog.
          </p>
          <button
            onClick={handleRecommend}
            disabled={isRecommendLoading || backlogTaskIds.length === 0}
            className="w-full text-xs font-bold py-2.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: "var(--c-raised)",
              border: "1px solid var(--c-border)",
              color: "var(--c-accent)",
            }}
            onMouseEnter={(e) => {
              if (!isRecommendLoading && backlogTaskIds.length > 0)
                (e.currentTarget as HTMLElement).style.borderColor = "var(--c-accent-bd)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)";
            }}
          >
            {isRecommendLoading ? (
              <>
                <span
                  className="w-3 h-3 border-2 rounded-full animate-spin"
                  style={{ borderColor: "var(--c-accent-bd)", borderTopColor: "var(--c-accent)" }}
                />
                Menganalisis...
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 8 8" fill="currentColor">
                  <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
                </svg>
                Rekomendasikan ({backlogTaskIds.length} task)
              </>
            )}
          </button>
        </div>

        {/* AI Suggestions */}
        <div className="px-4 py-4 flex-1">
          <p
            className="text-[10px] uppercase tracking-wider font-bold mb-3"
            style={{ color: "var(--c-muted)" }}
          >
            Saran AI{" "}
            {pending.length > 0 && (
              <span style={{ color: "var(--c-accent)" }}>({pending.length})</span>
            )}
          </p>
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-accent-bd)" }}
              >
                <svg width="14" height="14" viewBox="0 0 8 8" fill="var(--c-accent)">
                  <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
                </svg>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--c-muted)" }}>
                Generate tasks atau rekomendasi untuk mendapatkan saran AI.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg p-3 transition-all"
                  style={{
                    background: "var(--c-raised)",
                    border: "1px solid var(--c-border)",
                  }}
                >
                  <span
                    className="text-[9px] uppercase tracking-wide mb-1 block font-bold"
                    style={{ color: "var(--c-accent)" }}
                  >
                    {s.type}
                  </span>
                  <p className="text-[11px] font-medium mb-1 leading-tight" style={{ color: "var(--c-text)" }}>
                    {s.title}
                  </p>
                  <p className="text-[11px] line-clamp-3 leading-relaxed" style={{ color: "var(--c-muted)" }}>
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
