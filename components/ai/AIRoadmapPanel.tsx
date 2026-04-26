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
    <div className="flex flex-col items-start gap-2">
      {error && (
        <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E] text-xs font-bold rounded-lg hover:bg-[#C9A96E]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <span className="w-3 h-3 border-2 border-[#C9A96E]/20 border-t-[#C9A96E] rounded-full animate-spin" />
            Generating Roadmap...
          </>
        ) : (
          <>
            <span>✦</span>
            Generate AI Roadmap
          </>
        )}
      </button>
    </div>
  );
}
