"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Profile } from "@/types";

const SKILL_OPTIONS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "Python", "Go", "PostgreSQL", "Docker", "UI/UX Design",
  "DevOps", "Machine Learning",
];

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "true";

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
    if (!role.trim()) {
      setMessage({ type: "error", text: "Role/jabatan harus diisi." });
      return;
    }
    setIsSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from("profiles")
      .update({ role: role.trim(), skills, available_hours: availableHours })
      .eq("id", profile.id);

    if (error) {
      setMessage({ type: "error", text: error.message });
      setIsSaving(false);
    } else {
      if (isSetup) {
        router.push("/dashboard");
      } else {
        setMessage({ type: "success", text: "Profil berhasil disimpan!" });
        setIsSaving(false);
      }
    }
  };

  if (!profile) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--c-accent-bd)", borderTopColor: "var(--c-accent)" }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Onboarding banner untuk user baru */}
      {isSetup && (
        <div
          className="rounded-xl p-4 mb-6 flex items-start gap-3"
          style={{
            background: "var(--c-accent-bg)",
            border: "1px solid var(--c-accent-bd)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5" style={{ color: "var(--c-accent)" }}>
            <path d="M10 2l1.8 5.5H17l-4.6 3.3 1.8 5.5L10 13l-4.2 3.3 1.8-5.5L3 7.5h5.2z" fill="currentColor"/>
          </svg>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--c-accent)" }}>
              Selamat datang di SyncTeam, {profile.full_name}!
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--c-muted)" }}>
              Lengkapi profil kamu agar AI dapat membuat rekomendasi yang akurat untuk tim.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ color: "var(--c-text)" }}>
          {isSetup ? "Setup Profil" : profile.full_name}
        </h1>
        {!isSetup && (
          <span className="text-sm font-bold" style={{ color: "var(--c-accent)" }}>
            {profile.xp_points} XP
          </span>
        )}
      </div>
      {!isSetup && (
        <p className="text-sm mb-8" style={{ color: "var(--c-muted)" }}>
          Update role, skill, dan ketersediaan jam kerja kamu.
        </p>
      )}

      {message && (
        <div
          className="mb-6 p-3 rounded-lg text-sm border"
          style={{
            background: message.type === "success" ? "var(--c-green-bg)" : "var(--c-red-bg)",
            borderColor: message.type === "success" ? "var(--c-green)" : "var(--c-danger)",
            color: message.type === "success" ? "var(--c-green)" : "var(--c-danger)",
          }}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <Input
          label="Role / Jabatan"
          placeholder="Contoh: Front-end Engineer, Backend Developer, UI/UX Designer"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        />

        <div>
          <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--c-muted)" }}>
            Skills{" "}
            <span style={{ color: "var(--c-accent)" }}>
              ({skills.length} dipilih)
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={
                  skills.includes(skill)
                    ? {
                        background: "var(--c-accent-bg)",
                        borderColor: "var(--c-accent)",
                        color: "var(--c-accent)",
                      }
                    : {
                        background: "var(--c-raised)",
                        borderColor: "var(--c-border)",
                        color: "var(--c-muted)",
                      }
                }
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--c-muted)" }}>
            Jam Tersedia / Minggu:{" "}
            <span style={{ color: "var(--c-accent)" }}>{availableHours} jam</span>
          </label>
          <input
            type="range"
            min={1}
            max={40}
            value={availableHours}
            onChange={(e) => setAvailableHours(Number(e.target.value))}
            className="w-full accent-[var(--c-accent)]"
          />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--c-muted)" }}>
            <span>1 jam</span>
            <span>40 jam</span>
          </div>
        </div>

        <Button onClick={handleSave} loading={isSaving} className="w-full">
          {isSetup ? "Simpan & Mulai →" : "Simpan Profil"}
        </Button>
      </div>
    </div>
  );
}
