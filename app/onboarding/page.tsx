"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  
  // State untuk mengontrol fase UI (upload -> scanning -> result)
  const [step, setStep] = useState<'upload' | 'scanning' | 'result'>('upload');
  const [fileName, setFileName] = useState("");

  // Simulasi saat file di-upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
      setStep('scanning'); // Pindah ke fase scanning
      
      // Simulasi AI butuh waktu 3 detik untuk baca dokumen
      setTimeout(() => {
        setStep('result');
      }, 3000);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Dekorasi Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 blur-[60px] pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-2xl font-bold text-white mb-2">Setup Profil Anda</h1>
          <p className="text-neutral-400 text-sm">Biarkan AI menganalisis keahlian terbaik Anda untuk tim.</p>
        </div>

        {/* FASE 1: UPLOAD AREA */}
        {step === 'upload' && (
          <div className="relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-700 rounded-xl hover:border-amber-500 hover:bg-neutral-800/50 transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 text-neutral-500 group-hover:text-amber-500 mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-2 text-sm text-neutral-400"><span className="font-bold text-white">Klik untuk upload</span> atau drag and drop</p>
                <p className="text-xs text-neutral-500">PDF, DOCX, atau TXT (Maks. 5MB)</p>
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" />
            </label>
            <button 
              onClick={() => {
                 setFileName("Profil_Manual.pdf");
                 setStep('scanning');
                 setTimeout(() => setStep('result'), 3000);
              }}
              className="w-full mt-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Lewati & gunakan mode manual
            </button>
          </div>
        )}

        {/* FASE 2: AI SCANNING */}
        {step === 'scanning' && (
          <div className="flex flex-col items-center justify-center py-10 relative z-10 animate-in fade-in duration-300">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-neutral-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
            </div>
            <h3 className="text-white font-bold text-lg mb-1 animate-pulse">Menganalisis Dokumen...</h3>
            <p className="text-neutral-400 text-sm font-mono text-center">Claude membaca: {fileName}</p>
          </div>
        )}

        {/* FASE 3: HASIL ROLE */}
        {step === 'result' && (
          <div className="text-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-block bg-amber-500/20 border border-amber-500/50 px-4 py-1.5 rounded-full mb-4">
              <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">Role Ditemukan</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Front-end Engineer</h2>
            <p className="text-neutral-400 text-sm mb-8 px-4 leading-relaxed">
              Berdasarkan riwayat Anda dengan React, Next.js, dan Tailwind, AI menyarankan Anda untuk memimpin pengembangan antarmuka dan pengalaman pengguna (UX).
            </p>
            
            <button 
              onClick={() => console.log("Lanjut ke Lobby Room")}
              className="w-full bg-amber-500 text-neutral-950 font-bold py-3 px-4 rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Lanjutkan ke Ruang Tunggu 🚀
            </button>
          </div>
        )}

      </div>
    </main>
  );
}