"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Profile } from "@/types";

const SKILL_OPTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Go",
  "PostgreSQL",
  "Docker",
  "UI/UX Design",
  "DevOps",
  "Machine Learning",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [availableHours, setAvailableHours] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data as Profile);
        setRole(data.role ?? "");
        setSkills(data.skills ?? []);
        setAvailableHours(data.available_hours ?? 10);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from("profiles")
      .update({ role, skills, available_hours: availableHours })
      .eq("id", profile.id);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Profil berhasil disimpan!" });
    }
    setIsSaving(false);
  };

  if (!profile) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-[#C9A96E]/30 border-t-[#C9A96E] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#F5F4F0] mb-2">{profile.full_name}</h1>
      <p className="text-[#9CA3AF] text-sm mb-8">
        <span className="text-[#C9A96E]">{profile.xp_points} XP</span>
      </p>

      {message && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm border ${
            message.type === "success"
              ? "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]"
              : "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <Input
          label="Role / Jabatan"
          placeholder="Contoh: Front-end Engineer"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <div>
          <p className="text-xs text-[#9CA3AF] font-bold mb-2 uppercase tracking-wider">
            Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  skills.includes(skill)
                    ? "bg-[#C9A96E]/20 border-[#C9A96E] text-[#C9A96E]"
                    : "bg-[#1A1A1B] border-[#2A2A2B] text-[#9CA3AF] hover:border-[#C9A96E]/40"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#9CA3AF] font-bold mb-2 uppercase tracking-wider">
            Jam Tersedia / Minggu: {availableHours} jam
          </label>
          <input
            type="range"
            min={1}
            max={40}
            value={availableHours}
            onChange={(e) => setAvailableHours(Number(e.target.value))}
            className="w-full accent-[#C9A96E]"
          />
          <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
            <span>1 jam</span>
            <span>40 jam</span>
          </div>
        </div>

        <Button onClick={handleSave} loading={isSaving} className="w-full">
          Simpan Profil
        </Button>
      </div>
    </div>
  );
}
