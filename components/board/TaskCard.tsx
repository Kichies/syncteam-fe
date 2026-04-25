"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/types";
import Badge from "@/components/ui/Badge";
import { PRIORITY_LABELS } from "@/lib/utils/constants";

interface TaskCardProps {
  task: Task;
  index: number;
}

const priorityVariant: Record<string, "danger" | "in_progress" | "backlog"> = {
  high: "danger",
  medium: "in_progress",
  low: "backlog",
};

export default function TaskCard({ task, index }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          className={`bg-[#1A1A1B] border p-4 rounded-lg cursor-grab active:cursor-grabbing transition-colors shadow-sm mb-3 ${
            snapshot.isDragging
              ? "border-[#C9A96E] shadow-[#C9A96E]/20 shadow-lg scale-105 z-50"
              : "border-[#2A2A2B] hover:border-[#C9A96E]/50"
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <Badge variant={priorityVariant[task.priority] ?? "default"}>
              {PRIORITY_LABELS[task.priority] ?? task.priority}
            </Badge>
            {task.estimated_hours && (
              <span className="text-xs text-[#9CA3AF] font-mono">
                {task.estimated_hours}h est.
              </span>
            )}
          </div>
          <h4 className="text-[#F5F4F0] font-semibold text-sm leading-tight mb-2">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-[#9CA3AF] text-xs line-clamp-2">
              {task.description}
            </p>
          )}
          {task.ai_generated && (
            <p className="text-[#C9A96E]/60 text-[10px] mt-2">✦ AI generated</p>
          )}
        </div>
      )}
    </Draggable>
  );
}
