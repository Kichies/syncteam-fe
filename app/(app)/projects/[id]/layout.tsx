import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

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
    .select("id, name, owner_id")
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

  const tabs = [
    { href: `/projects/${id}/board`, label: "Board" },
    { href: `/projects/${id}/timeline`, label: "Timeline" },
    { href: `/projects/${id}/members`, label: "Anggota" },
    { href: `/projects/${id}/reports`, label: "Laporan" },
  ];

  return (
    <div className="flex flex-col h-full">
      <header className="bg-[#0E0E0F]/50 border-b border-[#2A2A2B] px-6 py-4 shrink-0">
        <h1 className="text-lg font-bold text-[#F5F4F0] mb-3">{project.name}</h1>
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-4 py-1.5 text-sm rounded-md transition-colors text-[#9CA3AF] hover:text-[#F5F4F0] hover:bg-[#2A2A2B]"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
