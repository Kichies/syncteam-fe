import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/date";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name, description, status, start_date, end_date, sprint_count, created_at, owner_id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const { data: memberIds } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user.id);

  const ownedIds = (ownedProjects ?? []).map((p) => p.id);
  const memberProjectIds = (memberIds ?? [])
    .map((r) => r.project_id)
    .filter((id) => !ownedIds.includes(id));

  const { data: memberProjects } =
    memberProjectIds.length > 0
      ? await supabase
          .from("projects")
          .select("id, name, description, status, start_date, end_date, sprint_count, created_at, owner_id")
          .in("id", memberProjectIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const allProjects = [
    ...(ownedProjects ?? []).map((p) => ({ ...p, isOwner: true })),
    ...(memberProjects ?? []).map((p) => ({ ...p, isOwner: false })),
  ];

  const statusVariant: Record<string, "completed" | "in_progress" | "backlog"> = {
    active: "completed",
    archived: "backlog",
    completed: "in_progress",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#F5F4F0]">Semua Proyek</h1>
        <Link href="/projects/new">
          <Button variant="primary">+ Buat Proyek</Button>
        </Link>
      </div>

      {allProjects.length === 0 ? (
        <Card>
          <p className="text-[#9CA3AF] text-sm text-center py-8">
            Belum ada proyek.{" "}
            <Link href="/projects/new" className="text-[#C9A96E] hover:underline">
              Buat proyek pertama Anda
            </Link>
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allProjects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}/board`}>
              <Card className="cursor-pointer hover:border-[#C9A96E]/40 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-[#F5F4F0] font-semibold">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[p.status] ?? "default"}>
                      {p.status}
                    </Badge>
                    {p.isOwner && (
                      <Badge variant="gold">owner</Badge>
                    )}
                  </div>
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
    </div>
  );
}
