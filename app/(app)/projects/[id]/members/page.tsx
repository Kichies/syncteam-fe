import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import InviteMemberModal from "@/components/project/InviteMemberModal";
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

  const { data: project } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", id)
    .single();

  const isOwner = project?.owner_id === user.id;

  const { data: memberRows } = await supabase
    .from("project_members")
    .select("id, role_in_project, joined_at, user_id")
    .eq("project_id", id);

  const userIds = (memberRows ?? []).map((m) => m.user_id);
  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role, skills, xp_points, available_hours")
          .in("id", userIds)
      : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));
  const members = (memberRows ?? []).map((m) => ({
    ...m,
    profile: profileMap.get(m.user_id) ?? null,
  }));

  const sorted = [...members].sort(
    (a, b) => (b.profile?.xp_points ?? 0) - (a.profile?.xp_points ?? 0),
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#F5F4F0]">Anggota Tim</h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {members.length} anggota · diurutkan berdasarkan XP
            </p>
          </div>
          {isOwner && <InviteMemberModal projectId={id} />}
        </div>

        <div className="space-y-3">
          {sorted.map((m, index) => {
            const profile = m.profile;
            if (!profile) return null;
            const initials = profile.full_name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <Card key={m.id} className="flex items-center gap-4">
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-xs font-bold text-[#9CA3AF] w-5 text-center">
                    {index + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A96E]/20 to-[#C9A96E]/5 border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] font-bold text-sm">
                    {initials}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[#F5F4F0] font-semibold text-sm truncate">
                      {profile.full_name}
                    </p>
                    {m.user_id === user.id && (
                      <span className="text-[9px] bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20 rounded px-1.5 py-0.5 uppercase font-bold shrink-0">
                        Saya
                      </span>
                    )}
                  </div>
                  <p className="text-[#9CA3AF] text-xs">
                    {m.role_in_project ?? profile.role ?? "Anggota"}
                    {profile.available_hours && (
                      <span className="text-[#9CA3AF]/60 ml-1">
                        · {profile.available_hours}h/minggu
                      </span>
                    )}
                  </p>
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {profile.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="text-[9px] bg-[#2A2A2B] text-[#9CA3AF] rounded px-1.5 py-0.5"
                        >
                          {s}
                        </span>
                      ))}
                      {profile.skills.length > 4 && (
                        <span className="text-[9px] text-[#9CA3AF]">
                          +{profile.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[#C9A96E] font-bold text-sm">
                    {profile.xp_points ?? 0}
                  </p>
                  <p className="text-[10px] text-[#9CA3AF]">XP</p>
                </div>
              </Card>
            );
          })}

          {members.length === 0 && (
            <Card>
              <p className="text-[#9CA3AF] text-sm text-center py-6">
                Belum ada anggota tim.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
