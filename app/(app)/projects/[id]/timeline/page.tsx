import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import { formatDate } from "@/lib/utils/date";

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-[#F5F4F0]">Timeline & Roadmap</h2>
      </div>

      {!sprints || sprints.length === 0 ? (
        <Card>
          <p className="text-[#9CA3AF] text-sm text-center py-8">
            Belum ada sprint. Generate roadmap AI untuk membuat timeline otomatis.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sprints.map((sprint) => (
            <Card key={sprint.id}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[#F5F4F0] font-semibold">
                  Sprint {sprint.sprint_number}: {sprint.name ?? `Sprint ${sprint.sprint_number}`}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    sprint.status === "completed"
                      ? "bg-[#10B981]/20 text-[#10B981]"
                      : "bg-[#F59E0B]/20 text-[#F59E0B]"
                  }`}
                >
                  {sprint.status}
                </span>
              </div>
              <p className="text-[#9CA3AF] text-xs">
                {formatDate(sprint.start_date)} – {formatDate(sprint.end_date)}
              </p>
              <div className="mt-3 bg-[#2A2A2B] rounded-full h-1.5">
                <div
                  className="bg-[#C9A96E] h-1.5 rounded-full transition-all"
                  style={{ width: `${sprint.progress_snapshot}%` }}
                />
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-1">
                {sprint.progress_snapshot}% selesai
              </p>
            </Card>
          ))}
        </div>
      )}

      {roadmap && (
        <div className="mt-8">
          <h3 className="text-sm font-bold text-[#9CA3AF] uppercase tracking-wider mb-4">
            Roadmap AI
          </h3>
          <Card>
            <pre className="text-[#9CA3AF] text-xs overflow-auto whitespace-pre-wrap">
              {JSON.stringify(roadmap.content, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
