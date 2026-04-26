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
    <aside className="w-72 shrink-0 bg-[#0E0E0F] border-l border-[#2A2A2B] flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2A2A2B] shrink-0 flex items-center gap-2">
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#C9A96E] bg-[#C9A96E]/10 border border-[#C9A96E]/25 rounded px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] inline-block" />
          AI Assistant
        </span>
      </div>

      <div className="overflow-y-auto flex-1 flex flex-col">
        {/* Task Breakdown */}
        <div className="px-4 py-4 border-b border-[#2A2A2B]">
          <p className="text-xs font-bold text-[#F5F4F0] mb-0.5">Task Breakdown</p>
          <p className="text-[11px] text-[#9CA3AF] mb-3 leading-relaxed">
            Deskripsikan fitur/modul, AI akan membuat sub-tasks otomatis.
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Buat fitur login dengan Google OAuth, session management, dan redirect ke dashboard..."
            rows={4}
            disabled={isBreakdownLoading}
            className="w-full bg-[#1A1A1B] border border-[#2A2A2B] rounded-lg p-2.5 text-[#F5F4F0] text-xs placeholder-[#9CA3AF]/40 focus:outline-none focus:border-[#C9A96E]/50 transition-colors resize-none disabled:opacity-50 mb-2"
          />
          {status && (
            <p className={`text-[11px] mb-2 leading-relaxed ${status.type === "success" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
              {status.msg}
            </p>
          )}
          <button
            onClick={handleBreakdown}
            disabled={isBreakdownLoading || description.trim().length < 10}
            className="w-full bg-[#C9A96E] hover:bg-[#b8935a] text-black text-xs font-bold py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isBreakdownLoading ? (
              <>
                <span className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              "✦ Generate Tasks"
            )}
          </button>
        </div>

        {/* Recommend Members */}
        <div className="px-4 py-4 border-b border-[#2A2A2B]">
          <p className="text-xs font-bold text-[#F5F4F0] mb-0.5">Rekomendasi Anggota</p>
          <p className="text-[11px] text-[#9CA3AF] mb-3 leading-relaxed">
            AI merekomendasikan siapa yang paling cocok untuk task di Backlog.
          </p>
          <button
            onClick={handleRecommend}
            disabled={isRecommendLoading || backlogTaskIds.length === 0}
            className="w-full bg-[#1A1A1B] hover:bg-[#2A2A2B] border border-[#2A2A2B] hover:border-[#C9A96E]/40 text-[#C9A96E] text-xs font-bold py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRecommendLoading ? (
              <>
                <span className="w-3 h-3 border-2 border-[#C9A96E]/20 border-t-[#C9A96E] rounded-full animate-spin" />
                Menganalisis...
              </>
            ) : (
              <>
                <span>✦</span>
                Rekomendasikan ({backlogTaskIds.length} task)
              </>
            )}
          </button>
        </div>

        {/* AI Suggestions */}
        <div className="px-4 py-4 flex-1">
          <p className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF] mb-3">
            Saran AI{" "}
            {pending.length > 0 && (
              <span className="text-[#C9A96E] ml-1">({pending.length})</span>
            )}
          </p>
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/8 border border-[#C9A96E]/15 flex items-center justify-center mb-3">
                <span className="text-[#C9A96E]">✦</span>
              </div>
              <p className="text-[#9CA3AF] text-[11px] leading-relaxed">
                Generate tasks atau rekomendasi untuk mendapatkan saran AI.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((s) => (
                <div
                  key={s.id}
                  className="bg-[#1A1A1B] border border-[#2A2A2B] rounded-lg p-3 hover:border-[#C9A96E]/25 transition-colors"
                >
                  <span className="text-[9px] uppercase tracking-wide text-[#C9A96E] mb-1 block font-bold">
                    {s.type}
                  </span>
                  <p className="text-[11px] text-[#F5F4F0] font-medium mb-1 leading-tight">
                    {s.title}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] line-clamp-3 leading-relaxed">
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
