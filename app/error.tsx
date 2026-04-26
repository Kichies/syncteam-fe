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
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#1A1A1B] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#C9A96E] mb-2">
            Terjadi Kesalahan
          </h1>
          <p className="text-[#9CA3AF] mb-6 text-sm">
            {error.message || "Sesuatu tidak berjalan dengan baik."}
          </p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-[#C9A96E] text-black font-semibold rounded-lg hover:bg-[#b8935a] transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
