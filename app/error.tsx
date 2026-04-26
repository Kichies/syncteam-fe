"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ margin: 0, background: "#000", color: "#ededed", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3L18 17H2L10 3z" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M10 8v4M10 14v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#C9A96E", marginBottom: "0.5rem" }}>
              Terjadi Kesalahan
            </h1>
            <p style={{ fontSize: "0.8125rem", color: "#888", marginBottom: "1.5rem", lineHeight: "1.6" }}>
              {error.message || "Sesuatu tidak berjalan dengan baik. Coba muat ulang halaman."}
            </p>
            {error.digest && (
              <p style={{ fontSize: "0.6875rem", color: "#333", marginBottom: "1.25rem", fontFamily: "monospace" }}>
                digest: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{ padding: "0.5rem 1.5rem", background: "#C9A96E", color: "#000", fontWeight: "700", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.875rem" }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
