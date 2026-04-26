import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AIRoadmapPanel from "@/components/ai/AIRoadmapPanel";
import { formatDate } from "@/lib/utils/date";

interface SprintItem { title: string; estimatedHours: number; priority: string; }
interface SprintFromRoadmap {
  sprintNumber: number; name: string; startDate: string; endDate: string;
  focus: string; milestones: string[]; suggestedTasks: SprintItem[];
}
interface RoadmapContent {
  sprints: SprintFromRoadmap[]; totalEstimatedHours: number; riskFactors: string[];
}

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects").select("owner_id").eq("id", id).single();
  const isOwner = project?.owner_id === user.id;

  const { data: sprints } = await supabase
    .from("sprints").select("*").eq("project_id", id)
    .order("sprint_number", { ascending: true });

  const { data: roadmap } = await supabase
    .from("roadmaps").select("content").eq("project_id", id)
    .order("version", { ascending: false }).limit(1).single();

  const roadmapContent = roadmap?.content as RoadmapContent | null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--c-text)" }}>
            Timeline & Roadmap
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--c-muted)" }}>
            Sprint planning dan AI-generated roadmap
          </p>
        </div>
        {isOwner && <AIRoadmapPanel projectId={id} />}
      </div>

      {/* Sprint Progress */}
      {sprints && sprints.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--c-muted)" }}>
            Sprint Progress
          </h3>
          <div className="space-y-2">
            {sprints.map((sprint) => (
              <div
                key={sprint.id}
                className="rounded-xl px-5 py-4"
                style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-medium" style={{ color: "var(--c-text)" }}>
                      {sprint.name ?? `Sprint ${sprint.sprint_number}`}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                      style={{
                        background: sprint.status === "completed" ? "var(--c-green-bg)" : "var(--c-amber-bg)",
                        color: sprint.status === "completed" ? "var(--c-green)" : "var(--c-amber)",
                        border: `1px solid ${sprint.status === "completed" ? "rgba(34,197,94,0.20)" : "rgba(245,158,11,0.20)"}`,
                      }}
                    >
                      {sprint.status === "completed" ? "Selesai" : "Aktif"}
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "var(--c-accent)" }}>
                    {sprint.progress_snapshot}%
                  </span>
                </div>
                <p className="text-[11px] mb-3" style={{ color: "var(--c-muted)" }}>
                  {formatDate(sprint.start_date)} — {formatDate(sprint.end_date)}
                </p>
                <div className="rounded-full h-1" style={{ background: "var(--c-raised)" }}>
                  <div
                    className="h-1 rounded-full transition-all duration-500"
                    style={{ width: `${sprint.progress_snapshot}%`, background: "var(--c-accent)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {(!sprints || sprints.length === 0) && !roadmapContent && (
        <div
          className="rounded-xl py-14 text-center"
          style={{ background: "var(--c-surface)", border: "1px dashed var(--c-border)" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-accent-bd)" }}
          >
            <svg width="18" height="18" viewBox="0 0 8 8" fill="var(--c-accent)">
              <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
            </svg>
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--c-text)" }}>
            Belum ada roadmap
          </p>
          <p className="text-xs max-w-xs mx-auto leading-relaxed" style={{ color: "var(--c-muted)" }}>
            {isOwner
              ? 'Klik "Generate AI Roadmap" di atas untuk membuat sprint otomatis.'
              : "Owner proyek belum membuat roadmap."}
          </p>
        </div>
      )}

      {/* Roadmap Content */}
      {roadmapContent && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold rounded px-2 py-1"
              style={{ background: "var(--c-accent-bg)", color: "var(--c-accent)", border: "1px solid var(--c-accent-bd)" }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
              </svg>
              AI Roadmap
            </span>
            {roadmapContent.totalEstimatedHours && (
              <span className="text-xs" style={{ color: "var(--c-muted)" }}>
                ~{roadmapContent.totalEstimatedHours} jam total
              </span>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {roadmapContent.sprints?.map((sprint) => (
              <div
                key={sprint.sprintNumber}
                className="rounded-xl p-5"
                style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: "var(--c-muted)" }}>
                      Sprint {sprint.sprintNumber}
                    </p>
                    <h4 className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>
                      {sprint.name}
                    </h4>
                    {sprint.focus && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--c-accent)" }}>
                        {sprint.focus}
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] text-right shrink-0 ml-4" style={{ color: "var(--c-muted)" }}>
                    {sprint.startDate}<br/>{sprint.endDate}
                  </p>
                </div>

                {sprint.milestones?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5" style={{ color: "var(--c-muted)" }}>
                      Milestones
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sprint.milestones.map((m, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded"
                          style={{ background: "var(--c-raised)", color: "var(--c-text)", border: "1px solid var(--c-border)" }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {sprint.suggestedTasks?.length > 0 && (
                  <div className="pt-3" style={{ borderTop: "1px solid var(--c-border)" }}>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: "var(--c-muted)" }}>
                      Suggested Tasks
                    </p>
                    <div className="space-y-1">
                      {sprint.suggestedTasks.slice(0, 4).map((t, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <span className="text-xs truncate" style={{ color: "var(--c-text)" }}>{t.title}</span>
                          <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--c-muted)" }}>
                            {t.estimatedHours}h
                          </span>
                        </div>
                      ))}
                      {sprint.suggestedTasks.length > 4 && (
                        <p className="text-[10px]" style={{ color: "var(--c-faint)" }}>
                          +{sprint.suggestedTasks.length - 4} lainnya
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {roadmapContent.riskFactors?.length > 0 && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--c-muted)" }}>
                Risk Factors
              </h3>
              <div className="space-y-2">
                {roadmapContent.riskFactors.map((risk, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg px-4 py-3"
                    style={{ background: "var(--c-red-bg)", border: "1px solid rgba(239,68,68,0.15)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 mt-0.5" style={{ color: "var(--c-red)" }}>
                      <path d="M6 1L11.2 10H.8L6 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                      <path d="M6 5v2.5M6 9v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--c-text)" }}>{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
