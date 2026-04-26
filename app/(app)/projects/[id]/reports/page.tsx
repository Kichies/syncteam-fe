import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils/date";
import type { Profile } from "@/types";

export default async function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberRows } = await supabase
    .from("project_members").select("user_id").eq("project_id", id);

  const memberUserIds = (memberRows ?? []).map((m) => m.user_id);
  const { data: profiles } = memberUserIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, xp_points").in("id", memberUserIds)
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

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-base font-semibold" style={{ color: "var(--c-text)" }}>
          Laporan & XP
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--c-muted)" }}>
          Leaderboard dan riwayat reward anggota tim
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--c-muted)" }}>
            Leaderboard XP
          </h3>
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
          >
            {leaderboard.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--c-muted)" }}>Belum ada data XP.</p>
              </div>
            ) : (
              leaderboard.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < leaderboard.length - 1 ? "1px solid var(--c-border)" : "none" }}
                >
                  <span
                    className={`text-xs font-mono w-6 text-center font-bold ${i < 3 ? "" : ""}`}
                    style={{ color: i === 0 ? "var(--c-accent)" : i === 1 ? "var(--c-muted)" : "var(--c-faint)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm truncate" style={{ color: "var(--c-text)" }}>
                    {p.full_name}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--c-accent)" }}>
                    {p.xp_points ?? 0} XP
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Reward History */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--c-muted)" }}>
            Riwayat Reward
          </h3>
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
          >
            {(!rewards || rewards.length === 0) ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--c-muted)" }}>Belum ada riwayat reward.</p>
              </div>
            ) : (
              rewards.map((r, i) => (
                <div
                  key={`${r.user_id}-${r.created_at}`}
                  className="flex items-start gap-3 px-4 py-3"
                  style={{ borderBottom: i < rewards.length - 1 ? "1px solid var(--c-border)" : "none" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                    style={{ background: r.type === "reward" ? "var(--c-green)" : "var(--c-red)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: "var(--c-text)" }}>
                      {profileMap.get(r.user_id) ?? "Unknown"}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: "var(--c-muted)" }}>
                      {r.reason}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--c-faint)" }}>
                      {formatDate(r.created_at)}
                    </p>
                  </div>
                  <span
                    className="text-sm font-semibold shrink-0"
                    style={{ color: r.type === "reward" ? "var(--c-green)" : "var(--c-red)" }}
                  >
                    {r.type === "reward" ? "+" : ""}{r.points}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
