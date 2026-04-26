import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InviteMemberModal from "@/components/project/InviteMemberModal";
import type { Profile } from "@/types";

export default async function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects").select("owner_id").eq("id", id).single();

  const isOwner = project?.owner_id === user.id;

  const { data: memberRows } = await supabase
    .from("project_members")
    .select("id, role_in_project, joined_at, user_id")
    .eq("project_id", id);

  const userIds = (memberRows ?? []).map((m) => m.user_id);
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles")
        .select("id, full_name, avatar_url, role, skills, xp_points, available_hours")
        .in("id", userIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));
  const members = (memberRows ?? [])
    .map((m) => ({ ...m, profile: profileMap.get(m.user_id) ?? null }))
    .sort((a, b) => (b.profile?.xp_points ?? 0) - (a.profile?.xp_points ?? 0));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--c-text)" }}>
            Anggota Tim
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--c-muted)" }}>
            {members.length} anggota · diurutkan berdasarkan XP
          </p>
        </div>
        {isOwner && <InviteMemberModal projectId={id} />}
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
      >
        {members.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: "var(--c-muted)" }}>
              Belum ada anggota tim.
            </p>
          </div>
        ) : (
          members.map((m, index) => {
            const profile = m.profile;
            if (!profile) return null;
            const initials = profile.full_name
              .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

            return (
              <div
                key={m.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{ borderBottom: index < members.length - 1 ? "1px solid var(--c-border)" : "none" }}
              >
                {/* Rank */}
                <span className="text-xs font-mono w-5 text-center" style={{ color: "var(--c-faint)" }}>
                  {index + 1}
                </span>

                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{
                    background: "var(--c-accent-bg)",
                    color: "var(--c-accent)",
                    border: "1px solid var(--c-accent-bd)",
                  }}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--c-text)" }}>
                      {profile.full_name}
                    </span>
                    {m.user_id === user.id && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                        style={{ background: "var(--c-accent-bg)", color: "var(--c-accent)", border: "1px solid var(--c-accent-bd)" }}
                      >
                        Anda
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--c-muted)" }}>
                    {m.role_in_project ?? profile.role ?? "Anggota"}
                    {profile.available_hours && (
                      <span style={{ color: "var(--c-faint)" }}> · {profile.available_hours}h/minggu</span>
                    )}
                  </p>
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {profile.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: "var(--c-raised)", color: "var(--c-muted)", border: "1px solid var(--c-border)" }}
                        >
                          {s}
                        </span>
                      ))}
                      {profile.skills.length > 4 && (
                        <span className="text-[9px]" style={{ color: "var(--c-faint)" }}>
                          +{profile.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* XP */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--c-accent)" }}>
                    {profile.xp_points ?? 0}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--c-muted)" }}>XP</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
