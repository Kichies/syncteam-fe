"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/types";
import { PRIORITY_LABELS } from "@/lib/utils/constants";

interface TaskCardProps {
  task: Task;
  index: number;
}

const PRIORITY_COLOR: Record<string, string> = {
  high:   "var(--c-red)",
  medium: "var(--c-amber)",
  low:    "var(--c-muted)",
};

export default function TaskCard({ task, index }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            background: snapshot.isDragging ? "var(--c-raised)" : "var(--c-surface)",
            border: `1px solid ${snapshot.isDragging ? "var(--c-accent)" : "var(--c-border)"}`,
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform ?? ""} scale(1.02)`
              : provided.draggableProps.style?.transform,
            boxShadow: snapshot.isDragging
              ? "0 16px 40px rgba(0,0,0,0.4)"
              : "none",
          }}
          className="rounded-lg p-3.5 cursor-grab active:cursor-grabbing mb-2 group transition-colors card-hover"
        >
          {/* Priority + hours row */}
          <div className="flex items-center justify-between mb-2.5">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1"
              style={{ color: PRIORITY_COLOR[task.priority] ?? "var(--c-muted)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: PRIORITY_COLOR[task.priority] ?? "var(--c-muted)" }}
              />
              {PRIORITY_LABELS[task.priority] ?? task.priority}
            </span>
            {task.estimated_hours && (
              <span
                className="text-[10px] font-mono"
                style={{ color: "var(--c-muted)" }}
              >
                {task.estimated_hours}h
              </span>
            )}
          </div>

          {/* Title */}
          <p
            className="text-sm font-medium leading-snug"
            style={{ color: "var(--c-text)" }}
          >
            {task.title}
          </p>

          {/* Description */}
          {task.description && (
            <p
              className="text-xs mt-1.5 line-clamp-2 leading-relaxed"
              style={{ color: "var(--c-muted)" }}
            >
              {task.description}
            </p>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between mt-3 pt-2.5" style={{ borderTop: "1px solid var(--c-border)" }}>
            {task.assignee ? (
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: "var(--c-accent-bg)", color: "var(--c-accent)", border: "1px solid var(--c-accent-bd)" }}
                >
                  {(task.assignee as { full_name: string }).full_name?.[0]?.toUpperCase()}
                </div>
                <span className="text-[10px] truncate max-w-[90px]" style={{ color: "var(--c-muted)" }}>
                  {(task.assignee as { full_name: string }).full_name}
                </span>
              </div>
            ) : (
              <span className="text-[10px]" style={{ color: "var(--c-faint)" }}>Belum diassign</span>
            )}
            {task.ai_generated && (
              <span className="text-[9px] font-medium" style={{ color: "var(--c-accent)" }}>
                ✦ AI
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
