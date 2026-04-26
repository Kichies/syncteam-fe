import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import TabNav from "@/components/project/TabNav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, owner_id, status")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: membership } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", id)
    .eq("user_id", user.id)
    .single();

  if (!membership && project.owner_id !== user.id) redirect("/projects");

  const isOwner = project.owner_id === user.id;

  const tabs = [
    { href: `/projects/${id}/board`, label: "Board", icon: "⊞" },
    { href: `/projects/${id}/timeline`, label: "Timeline", icon: "◈" },
    { href: `/projects/${id}/members`, label: "Anggota", icon: "◎" },
    { href: `/projects/${id}/reports`, label: "Laporan", icon: "◑" },
  ];

  const statusLabel: Record<string, string> = {
    active: "Aktif",
    completed: "Selesai",
    archived: "Diarsipkan",
  };

  return (
    <div className="flex flex-col h-full">
      <header
        className="px-6 py-3 shrink-0"
        style={{
          background: "var(--c-surface)",
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <h1
              className="text-sm font-bold truncate max-w-xs"
              style={{ color: "var(--c-text)" }}
            >
              {project.name}
            </h1>
            {isOwner && (
              <span
                className="text-[9px] rounded px-1.5 py-0.5 uppercase tracking-wider font-bold shrink-0"
                style={{
                  background: "var(--c-accent-bg)",
                  color: "var(--c-accent)",
                  border: "1px solid var(--c-accent-bd)",
                }}
              >
                Owner
              </span>
            )}
          </div>
          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0"
            style={{
              background:
                project.status === "active"
                  ? "var(--c-green-bg)"
                  : project.status === "completed"
                  ? "var(--c-accent-bg)"
                  : "rgba(156,163,175,0.12)",
              color:
                project.status === "active"
                  ? "var(--c-green)"
                  : project.status === "completed"
                  ? "var(--c-accent)"
                  : "var(--c-muted)",
            }}
          >
            {statusLabel[project.status] ?? project.status}
          </span>
        </div>
        <TabNav tabs={tabs} />
      </header>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
