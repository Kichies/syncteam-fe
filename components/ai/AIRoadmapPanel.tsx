"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AIRoadmapPanel({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal generate roadmap");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <div
          className="flex items-start gap-2 text-xs rounded-lg px-3 py-2 max-w-xs text-right"
          style={{
            color: "var(--c-danger)",
            background: "var(--c-red-bg)",
            border: "1px solid color-mix(in srgb, var(--c-danger) 20%, transparent)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 mt-0.5">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "var(--c-accent-bg)",
          border: "1px solid var(--c-accent-bd)",
          color: "var(--c-accent)",
        }}
        onMouseEnter={(e) => {
          if (!isLoading) (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--c-accent) 20%, transparent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--c-accent-bg)";
        }}
      >
        {isLoading ? (
          <>
            <span
              className="w-3 h-3 border-2 rounded-full animate-spin"
              style={{ borderColor: "var(--c-accent-bd)", borderTopColor: "var(--c-accent)" }}
            />
            Generating Roadmap...
          </>
        ) : (
          <>
            <svg width="10" height="10" viewBox="0 0 8 8" fill="currentColor">
              <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
            </svg>
            Generate AI Roadmap
          </>
        )}
      </button>
    </div>
  );
}
