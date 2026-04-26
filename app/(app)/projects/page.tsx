import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name, description, status, start_date, end_date, sprint_count, created_at, owner_id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const { data: memberIds } = await supabase
    .from("project_members").select("project_id").eq("user_id", user.id);

  const ownedIds = (ownedProjects ?? []).map((p) => p.id);
  const memberProjectIds = (memberIds ?? []).map((r) => r.project_id).filter((id) => !ownedIds.includes(id));

  const { data: memberProjects } = memberProjectIds.length > 0
    ? await supabase
        .from("projects")
        .select("id, name, description, status, start_date, end_date, sprint_count, created_at, owner_id")
        .in("id", memberProjectIds).order("created_at", { ascending: false })
    : { data: [] };

  const allProjects = [
    ...(ownedProjects ?? []).map((p) => ({ ...p, isOwner: true })),
    ...(memberProjects ?? []).map((p) => ({ ...p, isOwner: false })),
  ];

  const STATUS_COLOR: Record<string, string> = {
    active: "var(--c-green)",
    completed: "var(--c-accent)",
    archived: "var(--c-muted)",
  };

  const STATUS_LABEL: Record<string, string> = {
    active: "Aktif",
    completed: "Selesai",
    archived: "Diarsipkan",
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--c-text)" }}>
            Semua Proyek
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--c-muted)" }}>
            {allProjects.length} proyek
          </p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: "var(--c-accent)", color: "#000" }}
        >
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Buat Proyek
        </Link>
      </div>

      {allProjects.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: "var(--c-surface)", border: "1px dashed var(--c-border)" }}
        >
          <p className="text-sm mb-3" style={{ color: "var(--c-muted)" }}>
            Belum ada proyek.
          </p>
          <Link
            href="/projects/new"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--c-accent)" }}
          >
            Buat proyek pertama Anda →
          </Link>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
        >
          {allProjects.map((p, i) => (
            <Link key={p.id} href={`/projects/${p.id}/board`}>
              <div
                className="flex items-center gap-4 px-5 py-4 transition-all card-hover cursor-pointer"
                style={{
                  borderBottom: i < allProjects.length - 1 ? "1px solid var(--c-border)" : "none",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--c-raised)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                {/* Status dot */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: STATUS_COLOR[p.status] ?? "var(--c-muted)" }}
                />

                {/* Name + description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--c-text)" }}>
                      {p.name}
                    </span>
                    {p.isOwner && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider shrink-0"
                        style={{ background: "var(--c-accent-bg)", color: "var(--c-accent)", border: "1px solid var(--c-accent-bd)" }}
                      >
                        Owner
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--c-muted)" }}>
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Dates + status */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs" style={{ color: "var(--c-muted)" }}>
                    {formatDate(p.start_date)} — {formatDate(p.end_date)}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: STATUS_COLOR[p.status] ?? "var(--c-muted)" }}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </p>
                </div>

                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--c-faint)", flexShrink: 0 }}>
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
