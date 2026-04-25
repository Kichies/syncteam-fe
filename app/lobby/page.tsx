"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LobbyPage() {
  const router = useRouter();
  
  // State untuk melacak apakah user sedang mau input kode room
  const [isJoining, setIsJoining] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = () => {
    setIsLoading(true);
    // Simulasi loading bikin room, lalu lempar ke Dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleJoinRoom = () => {
    if (roomCode.length < 6) return;
    setIsLoading(true);
    // Simulasi loading verifikasi kode, lalu lempar ke Dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Efek Latar Belakang */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-200 tracking-tight mb-2">
            SyncTeam Lobby
          </h1>
          <p className="text-neutral-400 text-sm">Pilih jalur Anda untuk mulai berkolaborasi.</p>
        </div>

        {/* TAMPILAN 1: PILIH AKSI (CREATE ATAU JOIN) */}
        {!isJoining ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tombol Buat Room */}
            <button 
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full group relative bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-amber-500/50 hover:bg-neutral-800/50 transition-all text-left flex items-center justify-between overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Buat Workspace Baru</h3>
                <p className="text-xs text-neutral-500">Jadilah Host dan bagikan kode ke tim Anda.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-neutral-950 transition-colors">
                <span className="font-bold text-xl">+</span>
              </div>
            </button>

            {/* Tombol Gabung Room */}
            <button 
              onClick={() => setIsJoining(true)}
              className="w-full group bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-blue-500/50 hover:bg-neutral-800/50 transition-all text-left flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Gabung via Kode</h3>
                <p className="text-xs text-neutral-500">Punya kode 6-digit dari teman? Masuk di sini.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              </div>
            </button>
          </div>
        ) : (
          
          /* TAMPILAN 2: INPUT KODE ROOM */
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsJoining(false)}
              className="text-xs text-neutral-500 hover:text-white mb-6 flex items-center gap-1 transition-colors"
            >
              ← Kembali
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2">Masukkan Kode Room</h3>
            <p className="text-neutral-400 text-xs mb-6">Minta kode 6 digit dari Host proyek Anda.</p>
            
            <input 
              type="text" 
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Contoh: X7Y9A2" 
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-4 text-center text-2xl font-mono text-white tracking-[0.5em] placeholder-neutral-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all mb-6 uppercase"
            />
            
            <button 
              onClick={handleJoinRoom}
              disabled={roomCode.length < 6 || isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? "Memverifikasi..." : "Gabung Sekarang 🚀"}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}