"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createProjectSchema } from "@/lib/validations/schemas";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", description: "", start_date: "", end_date: "" });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = createProjectSchema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((i) => { fe[i.path[0] as string] = i.message; });
      setErrors(fe);
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

    if (error) { setErrors({ name: error.message }); setIsSaving(false); return; }

    await supabase.from("project_members").insert({ project_id: data.id, user_id: user.id });
    router.push(`/projects/${data.id}/board`);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--c-text)" }}>
          Buat Proyek Baru
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--c-muted)" }}>
          Isi detail proyek — AI akan siap membantu membuat roadmap dan task breakdown.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl p-6 space-y-5"
        style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
      >
        <Input
          label="Nama Proyek"
          placeholder="Contoh: E-Commerce MVP"
          value={form.name}
          onChange={set("name")}
          error={errors.name}
          required
        />

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-muted)" }}>
            Deskripsi
          </label>
          <textarea
            placeholder="Deskripsi singkat tujuan dan scope proyek ini..."
            value={form.description}
            onChange={set("description")}
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-sm resize-none input-field"
            style={{
              background: "var(--c-raised)",
              border: "1px solid var(--c-border)",
              color: "var(--c-text)",
            }}
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

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button type="submit" loading={isSaving} className="flex-1">
            Buat Proyek
          </Button>
        </div>
      </form>
    </div>
  );
}
