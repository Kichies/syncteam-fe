"use client"; // Wajib ditambahkan agar tombol bisa di-klik di Next.js

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // Fungsi untuk menangani klik tombol login
  const handleLogin = (provider: string) => {
    console.log(`Mencoba login dengan ${provider}...`);
    
    /* Nantinya di sini kita panggil Supabase Client dari timmu:
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'http://localhost:3000/auth/callback' } })
    */

    // Untuk sementara (karena API belum dicolok sepenuhnya), kita langsung bypass ke Dashboard
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-500 mb-2">SyncTeam AI</h1>
          <p className="text-neutral-400 text-sm">Masuk untuk mulai sinkronisasi tim Anda</p>
        </div>

        <div className="space-y-4">
          {/* Tombol Google */}
          <button 
            onClick={() => handleLogin('google')}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            {/* ... SVG Google ... */}
            Lanjutkan dengan Google
          </button>

          {/* Tombol GitHub */}
          <button 
            onClick={() => handleLogin('github')}
            className="w-full flex items-center justify-center gap-3 bg-neutral-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-neutral-700 border border-neutral-700 transition-colors"
          >
            {/* ... SVG GitHub ... */}
            Lanjutkan dengan GitHub
          </button>
        </div>
      </div>
    </main>
  );
}