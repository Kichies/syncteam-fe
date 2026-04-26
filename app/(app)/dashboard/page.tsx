import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import type { Project } from "@/types";

const STATUS_DOT: Record<string, string> = {
  backlog:     "var(--c-muted)",
  in_progress: "var(--c-amber)",
  completed:   "var(--c-green)",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, xp_points, role")
    .eq("id", user.id)
    .single();

  const { data: memberIds } = await supabase
    .from("project_members").select("project_id").eq("user_id", user.id);

  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name, status, start_date, end_date, owner_id, sprint_count, created_at, description")
    .eq("owner_id", user.id).eq("status", "active");

  const ownedIds = (ownedProjects ?? []).map((p) => p.id);
  const memberProjectIds = (memberIds ?? []).map((r) => r.project_id).filter((id) => !ownedIds.includes(id));

  const { data: memberProjects } = memberProjectIds.length > 0
    ? await supabase
        .from("projects")
        .select("id, name, status, start_date, end_date, owner_id, sprint_count, created_at, description")
        .in("id", memberProjectIds).eq("status", "active")
    : { data: [] };

  const projects: Project[] = [...(ownedProjects ?? []), ...(memberProjects ?? [])] as Project[];

  const { data: myTasks } = await supabase
    .from("tasks").select("id, title, status, priority, due_date, project_id")
    .eq("assigned_to", user.id).neq("status", "completed")
    .order("created_at", { ascending: false }).limit(6);

  const firstName = profile?.full_name?.split(" ")[0] ?? "User";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--c-text)" }}>
            Halo, {firstName}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--c-muted)" }}>
            {profile?.role ?? (
              <Link href="/profile" style={{ color: "var(--c-accent)" }} className="hover:underline">
                Setup profil Anda →
              </Link>
            )}
          </p>
        </div>
        <div
          className="text-right px-4 py-2.5 rounded-lg"
          style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
        >
          <p className="text-lg font-bold" style={{ color: "var(--c-accent)" }}>
            {profile?.xp_points ?? 0}
          </p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--c-muted)" }}>
            XP Points
          </p>
        </div>
      </div>

      {/* Projects */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium" style={{ color: "var(--c-muted)" }}>
            Proyek Aktif
            <span
              className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: "var(--c-raised)", color: "var(--c-muted)" }}
            >
              {projects.length}
            </span>
          </h2>
          <Link
            href="/projects/new"
            className="text-xs flex items-center gap-1 font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--c-accent)" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Buat Proyek
          </Link>
        </div>

        {projects.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "var(--c-surface)", border: "1px dashed var(--c-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--c-muted)" }}>
              Belum ada proyek aktif.{" "}
              <Link href="/projects/new" style={{ color: "var(--c-accent)" }} className="hover:underline">
                Buat proyek pertama Anda
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}/board`}>
                <div
                  className="rounded-xl p-4 transition-all cursor-pointer card-hover"
                  style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold leading-snug truncate" style={{ color: "var(--c-text)" }}>
                      {p.name}
                    </h3>
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                      style={{ background: "var(--c-green)" }}
                    />
                  </div>
                  {p.description && (
                    <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "var(--c-muted)" }}>
                      {p.description}
                    </p>
                  )}
                  <p className="text-[10px]" style={{ color: "var(--c-faint)" }}>
                    {formatDate(p.start_date)} — {formatDate(p.end_date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* My Tasks */}
      <section>
        <h2 className="text-sm font-medium mb-4" style={{ color: "var(--c-muted)" }}>
          Tugas Saya
          {myTasks && myTasks.length > 0 && (
            <span
              className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: "var(--c-raised)", color: "var(--c-muted)" }}
            >
              {myTasks.length}
            </span>
          )}
        </h2>

        {!myTasks || myTasks.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "var(--c-surface)", border: "1px dashed var(--c-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--c-muted)" }}>
              Tidak ada tugas yang ditugaskan ke Anda.
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
          >
            {myTasks.map((task, i) => (
              <div
                key={task.id}
                className="flex items-center gap-4 px-4 py-3"
                style={{
                  borderBottom: i < myTasks.length - 1 ? "1px solid var(--c-border)" : "none",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: STATUS_DOT[task.status] ?? "var(--c-muted)" }}
                />
                <span className="text-sm flex-1 truncate" style={{ color: "var(--c-text)" }}>
                  {task.title}
                </span>
                {task.due_date && (
                  <span className="text-xs shrink-0" style={{ color: "var(--c-muted)" }}>
                    {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
