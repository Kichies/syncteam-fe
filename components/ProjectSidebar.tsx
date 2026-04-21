"use client";

import { useState } from 'react';
import ActivityFeed from './ActivityFeed'; // Pastikan import ini ada

export default function ProjectSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* --- SIDEBAR UTAMA --- */}
      <div className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col h-full">
        {/* Header Sidebar */}
        <div className="p-4 shrink-0">
          <h2 className="text-xl font-bold text-amber-500 mb-6 px-2">SyncTeam</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 bg-neutral-900 text-white rounded-lg border border-neutral-800 shadow-sm">
              # Capstone MVP
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full text-left px-4 py-2 text-neutral-500 hover:text-white transition-colors text-sm"
            >
              + Buat Project Baru
            </button>
          </div>
        </div>

        {/* --- ACTIVITY FEED MASUK DI SINI --- */}
        <div className="flex-1 overflow-hidden flex flex-col border-t border-neutral-800/50 pt-4">
           <ActivityFeed />
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-neutral-800 text-xs text-neutral-500 shrink-0 bg-neutral-950">
          User: Hanif (Front-end)
        </div>
      </div>

      {/* --- POP-UP MODAL (VERSI LENGKAP) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          
          {/* Kotak Modal */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Buat Project Baru</h3>
            <p className="text-neutral-400 text-sm mb-6">Tentukan nama dan deskripsi proyek tim Anda.</p>
            
            {/* Form Input yang Sempat Hilang */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 font-bold mb-1 uppercase tracking-wider">Nama Project</label>
                <input 
                  type="text" 
                  placeholder="Contoh: E-Commerce MVP" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs text-neutral-400 font-bold mb-1 uppercase tracking-wider">Deskripsi Singkat</label>
                <textarea 
                  placeholder="Goal utama dari project ini..." 
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                ></textarea>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  console.log("Project baru berhasil disimpan!");
                }}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
              >
                Buat Project
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}