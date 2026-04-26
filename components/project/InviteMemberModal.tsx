"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type InviteMethod = "email" | "github";

interface Props {
  projectId: string;
}

export default function InviteMemberModal({ projectId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<InviteMethod>("email");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const body =
      method === "email"
        ? { email: value.trim() }
        : { github_username: value.trim().replace(/^@/, "") };

    try {
      const res = await fetch(`/api/projects/${projectId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json() as {
        data?: { message: string; fullName: string };
        error?: string;
      };

      if (!res.ok) {
        setError(json.error ?? "Gagal mengundang anggota.");
      } else {
        setSuccess(json.data?.message ?? "Berhasil ditambahkan.");
        setValue("");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setValue("");
    setError(null);
    setSuccess(null);
  }

  function handleMethodChange(m: InviteMethod) {
    setMethod(m);
    setValue("");
    setError(null);
    setSuccess(null);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs bg-[var(--c-accent-bg)] hover:bg-[var(--c-accent)]/20 text-[var(--c-accent)] border border-[var(--c-accent-bd)] rounded-lg px-3 py-1.5 font-semibold transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Undang Anggota
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[var(--c-text)] font-bold text-base">Undang Anggota Tim</h3>
                <p className="text-[var(--c-muted)] text-xs mt-0.5">
                  Cari via email atau username GitHub
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-raised)] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Method tabs */}
            <div className="flex gap-1 bg-[var(--c-raised)] rounded-lg p-1 mb-4">
              {(["email", "github"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handleMethodChange(m)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    method === m
                      ? "bg-[var(--c-surface)] text-[var(--c-text)] shadow-sm"
                      : "text-[var(--c-muted)] hover:text-[var(--c-text)]"
                  }`}
                >
                  {m === "email" ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <rect x="1" y="2.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M1 4l5 3.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      Email
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      GitHub
                    </>
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-[var(--c-muted)] font-medium block mb-1.5">
                  {method === "email" ? "Alamat Email" : "Username GitHub"}
                </label>
                <div className="relative">
                  {method === "github" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-muted)] text-sm font-medium">
                      @
                    </span>
                  )}
                  <input
                    type={method === "email" ? "email" : "text"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={method === "email" ? "nama@email.com" : "username"}
                    required
                    className={`w-full bg-[var(--c-raised)] border border-[var(--c-border)] rounded-lg py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors ${
                      method === "github" ? "pl-7 pr-3" : "px-3"
                    }`}
                  />
                </div>
                {method === "github" && (
                  <p className="text-[10px] text-[var(--c-muted)] mt-1">
                    Hanya untuk akun yang login via GitHub OAuth
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 text-[var(--c-danger)] text-xs bg-[var(--c-red-bg)] border border-[var(--c-danger)]/20 rounded-lg px-3 py-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 mt-0.5">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 text-[var(--c-green)] text-xs bg-[var(--c-green-bg)] border border-[var(--c-green)]/20 rounded-lg px-3 py-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 mt-0.5">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M3.5 6l2 2 3-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {success}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] border border-[var(--c-border)] hover:border-[var(--c-faint)] rounded-lg py-2 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !value.trim()}
                  className="flex-1 text-xs font-semibold bg-[var(--c-accent)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--c-bg)] rounded-lg py-2 transition-opacity"
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
