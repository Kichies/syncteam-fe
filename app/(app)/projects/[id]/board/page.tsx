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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, assignee:profiles(id, full_name, avatar_url)")
    .eq("project_id", id)
    .order("order_index", { ascending: true });

  const { data: suggestions } = await supabase
    .from("ai_suggestions")
    .select("id, type, title, body, is_accepted")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(15);

  const taskList = (tasks ?? []) as Task[];
  const backlogTaskIds = taskList
    .filter((t) => t.status === "backlog")
    .map((t) => t.id);

  return (
    <div className="flex h-full overflow-hidden">
      <BoardView projectId={id} initialTasks={taskList} />
      <AIBreakdownPanel
        projectId={id}
        suggestions={suggestions ?? []}
        backlogTaskIds={backlogTaskIds}
      />
    </div>
  );
}
