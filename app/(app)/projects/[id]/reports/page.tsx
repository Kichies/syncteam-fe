import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import { formatDate } from "@/lib/utils/date";
import type { Profile } from "@/types";

export default async function ReportsPage({
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
    .select("user_id")
    .eq("project_id", id);

  const memberUserIds = (memberRows ?? []).map((m) => m.user_id);

  const { data: profiles } =
    memberUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, xp_points")
          .in("id", memberUserIds)
      : { data: [] };

  const leaderboard = (profiles ?? []).sort(
    (a, b) => (b.xp_points ?? 0) - (a.xp_points ?? 0),
  ) as Profile[];

  const { data: rewards } = await supabase
    .from("reward_history")
    .select("user_id, points, reason, type, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name]),
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-bold text-[#F5F4F0] mb-6">Laporan & XP</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h3 className="text-sm font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">
            Leaderboard XP
          </h3>
          <div className="space-y-2">
            {leaderboard.map((p, i) => (
              <Card key={p.id} className="flex items-center gap-3 py-3">
                <span className="text-[#C9A96E] font-bold w-6 text-center">
                  {i + 1}
                </span>
                <span className="text-[#F5F4F0] text-sm flex-1">
                  {p.full_name}
                </span>
                <span className="text-[#C9A96E] font-bold text-sm">
                  {p.xp_points} XP
                </span>
              </Card>
            ))}
            {leaderboard.length === 0 && (
              <Card>
                <p className="text-[#9CA3AF] text-sm text-center py-4">
                  Belum ada data XP.
                </p>
              </Card>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">
            Riwayat Reward
          </h3>
          <div className="space-y-2">
            {(rewards ?? []).map((r) => (
              <Card key={`${r.user_id}-${r.created_at}`} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#F5F4F0] text-xs font-semibold">
                      {profileMap.get(r.user_id) ?? "Unknown"}
                    </p>
                    <p className="text-[#9CA3AF] text-[10px]">{r.reason}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      r.type === "reward" ? "text-[#10B981]" : "text-[#EF4444]"
                    }`}
                  >
                    {r.type === "reward" ? "+" : ""}
                    {r.points} XP
                  </span>
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-1">
                  {formatDate(r.created_at)}
                </p>
              </Card>
            ))}
            {(!rewards || rewards.length === 0) && (
              <Card>
                <p className="text-[#9CA3AF] text-sm text-center py-4">
                  Belum ada riwayat reward.
                </p>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
