"use client";
import { useState } from "react";

interface Props {
  projectId: string;
  onSuccess?: (name: string) => void;
}

export default function InviteMemberModal({ projectId, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json() as { data?: { message: string; fullName: string }; error?: string };

      if (!res.ok) {
        setError(json.error ?? "Gagal mengundang anggota.");
      } else {
        setSuccess(json.data?.message ?? "Berhasil ditambahkan.");
        setEmail("");
        onSuccess?.(json.data?.fullName ?? email);
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setEmail("");
    setError(null);
    setSuccess(null);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs bg-[#C9A96E]/10 hover:bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/30 rounded-lg px-3 py-1.5 font-semibold transition-colors"
      >
        <span className="text-base leading-none">+</span>
        Undang Anggota
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="bg-[#0E0E0F] border border-[#2A2A2B] rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[#F5F4F0] font-bold text-sm">Undang Anggota Tim</h3>
                <p className="text-[#9CA3AF] text-xs mt-0.5">
                  Masukkan email yang sudah terdaftar di SyncTeam
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-[#9CA3AF] hover:text-[#F5F4F0] text-lg leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-[#9CA3AF] font-medium block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full bg-[#1A1A1B] border border-[#2A2A2B] rounded-lg px-3 py-2 text-sm text-[#F5F4F0] placeholder-[#9CA3AF]/50 focus:outline-none focus:border-[#C9A96E]/50 transition-colors"
                />
              </div>

              {error && (
                <p className="text-[#EF4444] text-xs bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-[#10B981] text-xs bg-[#10B981]/8 border border-[#10B981]/20 rounded-lg px-3 py-2">
                  {success}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 text-xs text-[#9CA3AF] hover:text-[#F5F4F0] border border-[#2A2A2B] rounded-lg py-2 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="flex-1 text-xs font-semibold bg-[#C9A96E] hover:bg-[#d4b07a] disabled:opacity-50 disabled:cursor-not-allowed text-[#0E0E0F] rounded-lg py-2 transition-colors"
                >
                  {loading ? "Mengundang..." : "Undang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
