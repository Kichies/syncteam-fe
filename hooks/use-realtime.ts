"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/types";

export function useRealtimeTasks(projectId: string, initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE")
            setTasks((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? ({ ...t, ...payload.new } as Task) : t,
              ),
            );
          else if (payload.eventType === "INSERT")
            setTasks((prev) => [...prev, payload.new as Task]);
          else if (payload.eventType === "DELETE")
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase]);

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (tasks.filter((t) => t.status === "completed").length /
            tasks.length) *
            100,
        );

  return {
    tasks,
    setTasks,
    progress,
    byStatus: {
      backlog: tasks.filter((t) => t.status === "backlog"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      completed: tasks.filter((t) => t.status === "completed"),
    },
  };
}
