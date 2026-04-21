"use client";

import { useState } from 'react';
import { TaskType } from './TaskCard';

export default function AIDecomposePanel({ onAcceptTasks }: { onAcceptTasks: (tasks: TaskType[]) => void }) {
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [showUserChat, setShowUserChat] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const generatedTasks: TaskType[] = [
    { id: '1', title: 'Desain skema tabel Supabase', estHours: 2, priority: 'Tinggi' },
    { id: '2', title: 'Buat Endpoint API /api/auth', estHours: 3, priority: 'Tinggi' },
    { id: '3', title: 'Slicing UI Halaman Login', estHours: 2, priority: 'Sedang' },
    { id: '4', title: 'Integrasi OAuth Google & GitHub', estHours: 3, priority: 'Tinggi' }
  ];

  const dummyResponse = "Baik, saya akan memecah tugas tersebut.\n\nBerikut adalah rekomendasi *task* untuk tim Anda:\n1. Desain skema tabel Supabase (2 jam)\n2. Buat Endpoint API /api/auth (3 jam)\n3. Slicing UI Halaman Login (2 jam)\n4. Integrasi OAuth Google & GitHub (3 jam)\n\nSilakan klik tombol di bawah untuk memasukkan tugas ini ke Kanban Board Anda.";

  const handleGenerate = () => {
    if (!inputText.trim()) return;
    
    setShowUserChat(true);
    setIsGenerating(true);
    setIsDone(false);
    setStreamedText("");
    
    let currentIndex = 0;
    setTimeout(() => {
      const typingInterval = setInterval(() => {
        setStreamedText(dummyResponse.slice(0, currentIndex));
        currentIndex++;
        if (currentIndex > dummyResponse.length) {
          clearInterval(typingInterval);
          setIsGenerating(false);
          setIsDone(true);
        }
      }, 20);
    }, 500);
  };

  const handleAccept = () => {
     onAcceptTasks(generatedTasks);
     setIsDone(false);
     setShowUserChat(false);
     setStreamedText("");
     setInputText("");
  };

  return (
    <div className="h-full flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header Chat */}
      <div className="bg-neutral-800 p-4 border-b border-neutral-700 flex items-center gap-3 shrink-0">
        <span className="text-xl">✨</span>
        <div>
          <h3 className="font-bold text-amber-500 text-sm">AI Konsultan (Claude Sonnet)</h3>
          <p className="text-xs text-neutral-400">Siap memecah tugas Anda</p>
        </div>
      </div>

      {/* Area Balasan/Chat (Sudah Diperbaiki, Tidak Ada Duplikat) */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm font-sans">
        
        {/* Pesan Pembuka AI */}
        {!showUserChat && (
            <div className="bg-neutral-800/50 p-3 rounded-lg text-neutral-300 border border-neutral-700/50 w-[90%]">
            Halo! Ceritakan target proyek tim Anda hari ini, dan saya akan memecahnya menjadi tugas-tugas (*tasks*) yang terstruktur.
            </div>
        )}
        
        {/* Pesan User */}
        {showUserChat && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-100 ml-auto w-[90%] text-right">
            {inputText}
          </div>
        )}

        {/* Efek Streaming AI */}
        {(isGenerating || streamedText) && (
          <div className="bg-neutral-800/50 p-3 rounded-lg text-neutral-300 border border-neutral-700/50 w-[90%] whitespace-pre-wrap">
            {streamedText}
            {isGenerating && <span className="inline-block w-1.5 h-4 ml-1 bg-amber-500 animate-pulse"></span>}
          </div>
        )}

        {/* Tombol Setuju */}
        {isDone && (
             <button 
                onClick={handleAccept}
                className="w-full mt-4 bg-white text-black font-bold py-2 rounded-lg hover:bg-neutral-200 transition-colors shadow-lg animate-in slide-in-from-bottom-2"
             >
                + Tambahkan ke Kanban Board
             </button>
        )}
      </div>

      {/* Area Ketik (Input) */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950 shrink-0">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isGenerating || isDone}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none transition-colors disabled:opacity-50"
          rows={3}
          placeholder="Contoh: Tolong buatkan fitur login pakai Supabase..."
        ></textarea>
        
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !inputText.trim() || isDone}
          className="w-full mt-3 bg-amber-500 text-neutral-950 font-bold py-2.5 rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? "Sedang Memproses..." : "Generate Tasks 🚀"}
        </button>
      </div>
    </div>
  );
}