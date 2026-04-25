"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Data dummy untuk simulasi teman sekelompok yang sudah join
const mockMembers = [
  { id: 1, name: "Hanif (Kamu)", role: "Front-end Engineer", isHost: true, status: "Ready" },
  { id: 2, name: "Budi Satria", role: "Back-end Engineer", isHost: false, status: "Ready" },
  { id: 3, name: "Siti Aminah", role: "UI/UX Designer", isHost: false, status: "Mengetik CV..." },
];

export default function RoomPage() {
  const router = useRouter();
  const [members, setMembers] = useState(mockMembers);
  const [isStarting, setIsStarting] = useState(false);

  // Fungsi pura-pura untuk Host memulai proyek
  const handleStartProject = () => {
    setIsStarting(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-3xl">
        
        {/* Header Room */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-6 flex justify-between items-center shadow-lg">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">Capstone MVP</h1>
              <span className="bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Host Mode</span>
            </div>
            <p className="text-sm text-neutral-400">Kode Room: <span className="font-mono text-white tracking-widest font-bold">X7Y9A2</span></p>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-1">Anggota Terkumpul</p>
            <p className="text-2xl font-black text-white">3 <span className="text-neutral-500 text-lg font-normal">/ 4</span></p>
          </div>
        </div>

        {/* Daftar Anggota & Role Assignment */}
        <div className="space-y-3 mb-8">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 px-2">Susunan Tim (AI Suggested)</h2>
          
          {members.map((member) => (
            <div key={member.id} className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl flex items-center justify-between hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-4">
                {/* Avatar Initial */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  ${member.isHost ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'}`}>
                  {member.name.charAt(0)}
                </div>
                
                <div>
                  <h3 className="text-white font-bold text-sm">
                    {member.name} {member.isHost && <span className="text-amber-500 text-xs ml-1">👑</span>}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded">
                      🤖 AI: {member.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="text-right">
                {member.status === "Ready" ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,0.8)]"></div>
                    Ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium animate-pulse">
                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full"></div>
                    {member.status}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Slot Kosong untuk anggota yang belum masuk */}
          <div className="border-2 border-dashed border-neutral-800 rounded-xl p-4 flex items-center justify-center h-[74px]">
            <p className="text-neutral-500 text-sm flex items-center gap-2">
              <span className="animate-spin text-lg">⏳</span> Menunggu anggota lain bergabung...
            </p>
          </div>
        </div>

        {/* Tombol Eksekusi (Hanya aktif buat Host) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
          <p className="text-sm text-neutral-400 mb-4">Pastikan semua anggota telah mendapatkan role yang sesuai sebelum memulai.</p>
          <button 
            onClick={handleStartProject}
            disabled={isStarting}
            className="w-full max-w-sm mx-auto bg-white text-black font-bold py-3.5 px-4 rounded-xl hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isStarting ? "Membangun Workspace..." : "Kunci Role & Mulai Proyek 🚀"}
          </button>
        </div>

      </div>
    </main>
  );
}