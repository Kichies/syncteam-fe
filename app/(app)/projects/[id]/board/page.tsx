import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BoardView from "@/components/board/BoardView";
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

  return (
    <BoardView
      projectId={id}
      initialTasks={(tasks ?? []) as Task[]}
    />
  );
}
