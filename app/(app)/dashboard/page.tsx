import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/date";
import type { Project } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, xp_points, role")
    .eq("id", user.id)
    .single();

  const { data: memberIds } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user.id);

  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name, status, start_date, end_date, owner_id, sprint_count, created_at, description")
    .eq("owner_id", user.id)
    .eq("status", "active");

  const ownedIds = (ownedProjects ?? []).map((p) => p.id);
  const memberProjectIds = (memberIds ?? [])
    .map((r) => r.project_id)
    .filter((id) => !ownedIds.includes(id));

  const { data: memberProjects } =
    memberProjectIds.length > 0
      ? await supabase
          .from("projects")
          .select("id, name, status, start_date, end_date, owner_id, sprint_count, created_at, description")
          .in("id", memberProjectIds)
          .eq("status", "active")
      : { data: [] };

  const projects: Project[] = [
    ...(ownedProjects ?? []),
    ...(memberProjects ?? []),
  ] as Project[];

  const { data: myTasks } = await supabase
    .from("tasks")
    .select("id, title, status, priority, due_date")
    .eq("assigned_to", user.id)
    .neq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5);

  const statusVariant: Record<string, "backlog" | "in_progress" | "completed"> = {
    backlog: "backlog",
    in_progress: "in_progress",
    completed: "completed",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F5F4F0]">
          Halo, {profile?.full_name ?? "User"} 👋
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          {profile?.role ?? "Belum set role"} &middot;{" "}
          <span className="text-[#C9A96E]">
            {profile?.xp_points ?? 0} XP
          </span>
        </p>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#9CA3AF] uppercase tracking-wider">
            Proyek Aktif
          </h2>
          <Link
            href="/projects/new"
            className="text-xs text-[#C9A96E] hover:underline"
          >
            + Buat Proyek
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card>
            <p className="text-[#9CA3AF] text-sm text-center py-4">
              Belum ada proyek aktif.{" "}
              <Link href="/projects/new" className="text-[#C9A96E] hover:underline">
                Buat sekarang
              </Link>
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}/board`}>
                <Card className="hover:border-[#C9A96E]/40 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-[#F5F4F0] font-semibold text-sm leading-tight">
                      {p.name}
                    </h3>
                    <Badge variant="completed">aktif</Badge>
                  </div>
                  {p.description && (
                    <p className="text-[#9CA3AF] text-xs line-clamp-2 mb-3">
                      {p.description}
                    </p>
                  )}
                  <p className="text-[10px] text-[#9CA3AF]">
                    {formatDate(p.start_date)} – {formatDate(p.end_date)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold text-[#9CA3AF] uppercase tracking-wider mb-4">
          Tugas Saya
        </h2>
        {!myTasks || myTasks.length === 0 ? (
          <Card>
            <p className="text-[#9CA3AF] text-sm text-center py-4">
              Tidak ada tugas yang ditugaskan ke Anda.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {myTasks.map((task) => (
              <Card key={task.id} className="flex items-center gap-3 py-3">
                <Badge variant={statusVariant[task.status] ?? "default"}>
                  {task.status}
                </Badge>
                <span className="text-[#F5F4F0] text-sm flex-1 truncate">
                  {task.title}
                </span>
                {task.due_date && (
                  <span className="text-[10px] text-[#9CA3AF] shrink-0">
                    {formatDate(task.due_date)}
                  </span>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
