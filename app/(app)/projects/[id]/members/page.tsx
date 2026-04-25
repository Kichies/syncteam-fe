import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Profile } from "@/types";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberRows } = await supabase
    .from("project_members")
    .select("id, role_in_project, joined_at, user_id")
    .eq("project_id", id);

  const userIds = (memberRows ?? []).map((m) => m.user_id);
  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role, skills, xp_points")
          .in("id", userIds)
      : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p as Profile]),
  );

  const members = (memberRows ?? []).map((m) => ({
    ...m,
    profile: profileMap.get(m.user_id) ?? null,
  }));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-[#F5F4F0] mb-6">
        Anggota Tim ({members.length})
      </h2>

      <div className="space-y-3">
        {members.map((m) => {
          const profile = m.profile;
          if (!profile) return null;
          return (
            <Card key={m.id} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] font-bold text-sm shrink-0">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F5F4F0] font-semibold text-sm">
                  {profile.full_name}
                </p>
                <p className="text-[#9CA3AF] text-xs">
                  {m.role_in_project ?? profile.role ?? "Anggota"}
                </p>
                {profile.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.skills.slice(0, 3).map((s) => (
                      <Badge key={s} variant="default">
                        {s}
                      </Badge>
                    ))}
                    {profile.skills.length > 3 && (
                      <span className="text-[10px] text-[#9CA3AF]">
                        +{profile.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#C9A96E] font-bold text-sm">
                  {profile.xp_points} XP
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
