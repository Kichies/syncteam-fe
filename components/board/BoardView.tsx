"use client";

import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import { useRealtimeTasks } from "@/hooks/use-realtime";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/utils/constants";
import Badge from "@/components/ui/Badge";

interface BoardViewProps {
  projectId: string;
  initialTasks: Task[];
}

const columns: { id: TaskStatus; variant: "backlog" | "in_progress" | "completed" }[] = [
  { id: "backlog", variant: "backlog" },
  { id: "in_progress", variant: "in_progress" },
  { id: "completed", variant: "completed" },
];

export default function BoardView({ projectId, initialTasks }: BoardViewProps) {
  const { setTasks, byStatus } = useRealtimeTasks(projectId, initialTasks);
  const supabase = createClient();

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const taskId = result.draggableId;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as TaskStatus;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full min-w-max">
            {columns.map(({ id, variant }) => {
              const colTasks = byStatus[id];
              return (
                <div
                  key={id}
                  className="w-80 flex-shrink-0 flex flex-col bg-[#0E0E0F]/30 border border-[#2A2A2B]/50 rounded-2xl p-4 overflow-hidden h-full"
                >
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h2 className="text-xs font-bold text-[#F5F4F0] uppercase tracking-wider">
                      {STATUS_LABELS[id]}
                    </h2>
                    <Badge variant={variant}>{colTasks.length}</Badge>
                  </div>

                  <Droppable droppableId={id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 overflow-y-auto pr-1 pb-4 transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-[#2A2A2B]/20 rounded-lg"
                            : ""
                        }`}
                      >
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="h-32 flex items-center justify-center text-[#9CA3AF] text-xs border-2 border-dashed border-[#2A2A2B] rounded-lg">
                            Kosong
                          </div>
                        )}
                        {colTasks.map((task: Task, index: number) => (
                          <TaskCard key={task.id} task={task} index={index} />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
