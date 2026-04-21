"use client";

import { Draggable } from '@hello-pangea/dnd';

export interface TaskType {
  id: string;
  title: string;
  estHours: number;
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
}

interface TaskCardProps {
  task: TaskType;
  index: number; // Index wajib ada buat ngasih tau urutannya
}

export default function TaskCard({ task, index }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Tinggi': return 'bg-red-500/20 text-red-400';
      case 'Sedang': return 'bg-amber-500/20 text-amber-400';
      case 'Rendah': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-neutral-500/20 text-neutral-400';
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-neutral-800 border p-4 rounded-lg cursor-grab active:cursor-grabbing transition-colors shadow-sm mb-3
            ${snapshot.isDragging ? 'border-amber-500 shadow-amber-500/20 shadow-lg scale-105 z-50' : 'border-neutral-700 hover:border-amber-500/50'}`}
          // Biar pas ditarik animasinya mulus
          style={{ ...provided.draggableProps.style }}
        >
          <div className="flex justify-between items-start mb-3">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
              Prioritas {task.priority}
            </span>
            <span className="text-xs text-neutral-500 font-mono">{task.estHours}h est.</span>
          </div>
          <h4 className="text-white font-semibold text-sm leading-tight mb-2">{task.title}</h4>
          <p className="text-neutral-400 text-xs line-clamp-2">Di-generate otomatis oleh AI Konsultan.</p>
        </div>
      )}
    </Draggable>
  );
}