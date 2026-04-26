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
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  return (
    <div className="flex flex-col h-full">
      <header className="bg-[#0E0E0F] border-b border-[#2A2A2B] px-6 py-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-[#F5F4F0] truncate max-w-xs">
              {project.name}
            </h1>
            {isOwner && (
              <span className="text-[9px] bg-[#C9A96E]/12 text-[#C9A96E] border border-[#C9A96E]/25 rounded px-1.5 py-0.5 uppercase tracking-wider font-bold shrink-0">
                Owner
              </span>
            )}
          </div>
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
              project.status === "active"
                ? "bg-[#10B981]/12 text-[#10B981]"
                : project.status === "completed"
                ? "bg-[#C9A96E]/12 text-[#C9A96E]"
                : "bg-[#9CA3AF]/12 text-[#9CA3AF]"
            }`}
          >
            {project.status}
          </span>
        </div>
        <TabNav tabs={tabs} />
      </header>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
