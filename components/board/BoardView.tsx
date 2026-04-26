"use client";

import { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import { useRealtimeTasks } from "@/hooks/use-realtime";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskStatus, TaskPriority } from "@/types";
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

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function AddTaskForm({
  status,
  projectId,
  onAdd,
  onCancel,
}: {
  status: TaskStatus;
  projectId: string;
  onAdd: (task: Task) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        title: title.trim(),
        priority,
        status,
        ai_generated: false,
        order_index: 0,
        required_skills: [],
      })
      .select("*")
      .single();

    if (!error && data) {
      onAdd(data as Task);
      setTitle("");
      setPriority("medium");
    }
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg p-3 mt-2"
      style={{ background: "var(--c-raised)", border: "1px solid var(--c-accent-bd)" }}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Judul task..."
        className="w-full text-xs bg-transparent outline-none mb-2"
        style={{ color: "var(--c-text)" }}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="flex items-center gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className="text-[10px] rounded px-1.5 py-1 flex-1 outline-none"
          style={{
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            color: "var(--c-muted)",
          }}
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] px-2 py-1 rounded transition-colors"
          style={{ color: "var(--c-muted)" }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="text-[10px] px-2.5 py-1 rounded font-semibold disabled:opacity-40 transition-opacity"
          style={{ background: "var(--c-accent)", color: "var(--c-bg)" }}
        >
          {saving ? "..." : "Tambah"}
        </button>
      </div>
    </form>
  );
}

export default function BoardView({ projectId, initialTasks }: BoardViewProps) {
  const { tasks, setTasks, byStatus } = useRealtimeTasks(projectId, initialTasks);
  const supabase = createClient();
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const taskId = result.draggableId;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as TaskStatus;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
  };

  const handleTaskAdded = (task: Task) => {
    setTasks((prev) => [...prev, task]);
    setAddingToColumn(null);
  };

  // suppress unused warning — tasks is used by byStatus via useRealtimeTasks
  void tasks;

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
                  className="w-80 flex-shrink-0 flex flex-col rounded-2xl p-4 overflow-hidden h-full"
                  style={{
                    background: "color-mix(in srgb, var(--c-surface) 60%, transparent)",
                    border: "1px solid var(--c-border)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h2
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "var(--c-text)" }}
                    >
                      {STATUS_LABELS[id]}
                    </h2>
                    <Badge variant={variant}>{colTasks.length}</Badge>
                  </div>

                  <Droppable droppableId={id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex-1 overflow-y-auto pr-1 pb-2 transition-colors rounded-lg"
                        style={{
                          background: snapshot.isDraggingOver
                            ? "color-mix(in srgb, var(--c-accent) 5%, transparent)"
                            : "transparent",
                        }}
                      >
                        {colTasks.length === 0 && !snapshot.isDraggingOver && addingToColumn !== id && (
                          <div
                            className="h-24 flex items-center justify-center text-xs border-2 border-dashed rounded-lg"
                            style={{ color: "var(--c-faint)", borderColor: "var(--c-border)" }}
                          >
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

                  {/* Add Task area */}
                  <div className="shrink-0 pt-2" style={{ borderTop: "1px solid var(--c-border)" }}>
                    {addingToColumn === id ? (
                      <AddTaskForm
                        status={id}
                        projectId={projectId}
                        onAdd={handleTaskAdded}
                        onCancel={() => setAddingToColumn(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setAddingToColumn(id)}
                        className="w-full flex items-center gap-1.5 text-xs py-2 px-1 rounded-lg transition-all"
                        style={{ color: "var(--c-muted)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "var(--c-accent)";
                          (e.currentTarget as HTMLElement).style.background = "var(--c-accent-bg)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "var(--c-muted)";
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Tambah task
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
