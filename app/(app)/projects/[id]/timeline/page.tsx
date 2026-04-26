import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import AIRoadmapPanel from "@/components/ai/AIRoadmapPanel";
import { formatDate } from "@/lib/utils/date";

interface SprintItem {
  title: string;
  estimatedHours: number;
  priority: string;
}

interface SprintFromRoadmap {
  sprintNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  focus: string;
  milestones: string[];
  suggestedTasks: SprintItem[];
}

interface RoadmapContent {
  sprints: SprintFromRoadmap[];
  totalEstimatedHours: number;
  riskFactors: string[];
}

export default async function TimelinePage({
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

  const { data: sprints } = await supabase
    .from("sprints")
    .select("*")
    .eq("project_id", id)
    .order("sprint_number", { ascending: true });

  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("content")
    .eq("project_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const roadmapContent = roadmap?.content as RoadmapContent | null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#F5F4F0]">Timeline & Roadmap</h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Sprint planning dan AI-generated roadmap
            </p>
          </div>
          {isOwner && <AIRoadmapPanel projectId={id} />}
        </div>

        {/* Sprint Progress */}
        {sprints && sprints.length > 0 && (
          <section className="mb-8">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF] mb-3">
              Sprint Progress
            </p>
            <div className="space-y-3">
              {sprints.map((sprint) => (
                <Card key={sprint.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">
                        Sprint {sprint.sprint_number}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          sprint.status === "completed"
                            ? "bg-[#10B981]/12 text-[#10B981]"
                            : "bg-[#F59E0B]/12 text-[#F59E0B]"
                        }`}
                      >
                        {sprint.status === "completed" ? "Selesai" : "Aktif"}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#C9A96E]">
                      {sprint.progress_snapshot}%
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#F5F4F0] mb-1">
                    {sprint.name ?? `Sprint ${sprint.sprint_number}`}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] mb-3">
                    {formatDate(sprint.start_date)} – {formatDate(sprint.end_date)}
                  </p>
                  <div className="bg-[#2A2A2B] rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-[#C9A96E] to-[#e8c47a] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${sprint.progress_snapshot}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {(!sprints || sprints.length === 0) && !roadmapContent && (
          <Card>
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-[#C9A96E]/8 border border-[#C9A96E]/15 flex items-center justify-center mx-auto mb-4">
                <span className="text-[#C9A96E] text-2xl">✦</span>
              </div>
              <p className="text-[#F5F4F0] font-semibold text-sm mb-2">
                Belum ada roadmap
              </p>
              <p className="text-[#9CA3AF] text-xs leading-relaxed max-w-xs mx-auto">
                {isOwner
                  ? 'Klik "Generate AI Roadmap" di atas untuk membuat sprint dan timeline otomatis berdasarkan proyek dan anggota tim.'
                  : "Owner proyek belum membuat roadmap. Minta owner untuk generate AI roadmap."}
              </p>
            </div>
          </Card>
        )}

        {/* Roadmap AI Content */}
        {roadmapContent && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#C9A96E] bg-[#C9A96E]/10 border border-[#C9A96E]/25 rounded px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] inline-block" />
                  AI Roadmap
                </span>
                {roadmapContent.totalEstimatedHours && (
                  <span className="text-xs text-[#9CA3AF]">
                    ~{roadmapContent.totalEstimatedHours} jam total
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {roadmapContent.sprints?.map((sprint) => (
                <Card key={sprint.sprintNumber}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-bold mb-1">
                        Sprint {sprint.sprintNumber}
                      </p>
                      <h4 className="text-[#F5F4F0] font-semibold text-sm">{sprint.name}</h4>
                      {sprint.focus && (
                        <p className="text-[#C9A96E] text-xs mt-0.5">
                          Fokus: {sprint.focus}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] shrink-0 ml-4 text-right">
                      {sprint.startDate}
                      <br />
                      {sprint.endDate}
                    </p>
                  </div>

                  {sprint.milestones && sprint.milestones.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] uppercase text-[#9CA3AF] font-bold mb-1.5">
                        Milestones
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {sprint.milestones.map((m, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-[#2A2A2B] text-[#F5F4F0] rounded-md px-2 py-0.5"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sprint.suggestedTasks && sprint.suggestedTasks.length > 0 && (
                    <div className="mt-3 border-t border-[#2A2A2B] pt-3">
                      <p className="text-[10px] uppercase text-[#9CA3AF] font-bold mb-2">
                        Suggested Tasks
                      </p>
                      <div className="space-y-1.5">
                        {sprint.suggestedTasks.slice(0, 4).map((t, i) => (
                          <div key={i} className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-[#F5F4F0] truncate">{t.title}</span>
                            <span className="text-[10px] text-[#9CA3AF] shrink-0 font-mono">
                              {t.estimatedHours}h
                            </span>
                          </div>
                        ))}
                        {sprint.suggestedTasks.length > 4 && (
                          <p className="text-[10px] text-[#9CA3AF]">
                            +{sprint.suggestedTasks.length - 4} lainnya
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {roadmapContent.riskFactors && roadmapContent.riskFactors.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF] mb-3">
                  Risk Factors
                </p>
                <div className="space-y-2">
                  {roadmapContent.riskFactors.map((risk, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-lg px-3 py-2.5"
                    >
                      <span className="text-[#EF4444] text-xs shrink-0 mt-0.5">⚠</span>
                      <p className="text-[11px] text-[#F5F4F0] leading-relaxed">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
