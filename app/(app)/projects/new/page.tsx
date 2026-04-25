"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createProjectSchema } from "@/lib/validations/schemas";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = createProjectSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase
      .from("projects")
      .insert({ ...result.data, owner_id: user.id })
      .select("id")
      .single();

    if (error) {
      setErrors({ name: error.message });
      setIsSaving(false);
      return;
    }

    await supabase
      .from("project_members")
      .insert({ project_id: data.id, user_id: user.id });

    router.push(`/projects/${data.id}/board`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-[#F5F4F0] mb-2">Buat Proyek Baru</h1>
      <p className="text-[#9CA3AF] text-sm mb-8">
        Isi detail proyek tim Anda. AI akan membantu membuat roadmap dan task breakdown.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nama Proyek"
          placeholder="Contoh: E-Commerce MVP"
          value={form.name}
          onChange={set("name")}
          error={errors.name}
          required
        />
        <div>
          <label className="block text-xs text-[#9CA3AF] font-bold mb-1 uppercase tracking-wider">
            Deskripsi
          </label>
          <textarea
            placeholder="Deskripsi singkat tujuan proyek..."
            value={form.description}
            onChange={set("description")}
            rows={3}
            className="w-full bg-[#1A1A1B] border border-[#2A2A2B] rounded-lg p-3 text-[#F5F4F0] placeholder-[#9CA3AF]/50 focus:outline-none focus:border-[#C9A96E] transition-colors resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tanggal Mulai"
            type="date"
            value={form.start_date}
            onChange={set("start_date")}
            error={errors.start_date}
            required
          />
          <Input
            label="Tanggal Selesai"
            type="date"
            value={form.end_date}
            onChange={set("end_date")}
            error={errors.end_date}
            required
          />
        </div>
        <Button type="submit" loading={isSaving} className="w-full">
          Buat Proyek
        </Button>
      </form>
    </div>
  );
}
