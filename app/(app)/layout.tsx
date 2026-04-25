import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import type { Project } from "@/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: memberIds } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user.id);

  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name, status, start_date, end_date, owner_id, sprint_count, created_at, description")
    .eq("owner_id", user.id);

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
      : { data: [] };

  const allProjects: Project[] = [
    ...(ownedProjects ?? []),
    ...(memberProjects ?? []),
  ] as Project[];

  return (
    <div className="h-screen w-screen bg-[#1A1A1B] flex overflow-hidden font-sans">
      <Sidebar
        projects={allProjects}
        userName={profile?.full_name ?? user.email ?? "User"}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
