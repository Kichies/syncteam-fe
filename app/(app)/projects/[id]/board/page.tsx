import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BoardView from "@/components/board/BoardView";
import AIBreakdownPanel from "@/components/ai/AIBreakdownPanel";
import type { Task } from "@/types";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, assignee:profiles(id, full_name, avatar_url)")
    .eq("project_id", id)
    .order("order_index", { ascending: true });

  const { data: suggestions } = await supabase
    .from("ai_suggestions")
    .select("id, type, title, body, is_accepted, metadata")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(15);

  const { data: memberRows } = await supabase
    .from("project_members")
    .select("user_id, profiles(id, full_name)")
    .eq("project_id", id);

  const taskList = (tasks ?? []) as Task[];
  const backlogTaskIds = taskList
    .filter((t) => t.status === "backlog")
    .map((t) => t.id);

  // Map userId → full_name untuk tampilan di AI panel
  const memberMap: Record<string, string> = {};
  (memberRows ?? []).forEach((m) => {
    const profile = m.profiles as { id: string; full_name: string } | null;
    if (profile) memberMap[profile.id] = profile.full_name;
  });

  // Map taskId → title untuk tampilan di AI panel
  const taskMap: Record<string, string> = {};
  taskList.forEach((t) => { taskMap[t.id] = t.title; });

  // Normalise metadata (Json type from Supabase) to Record<string, unknown>
  const normalisedSuggestions = (suggestions ?? []).map((s) => ({
    ...s,
    metadata: (s.metadata ?? undefined) as Record<string, unknown> | undefined,
  }));

  return (
    <div className="flex h-full overflow-hidden">
      <BoardView projectId={id} initialTasks={taskList} />
      <AIBreakdownPanel
        projectId={id}
        suggestions={normalisedSuggestions}
        backlogTaskIds={backlogTaskIds}
        memberMap={memberMap}
        taskMap={taskMap}
      />
    </div>
  );
}
