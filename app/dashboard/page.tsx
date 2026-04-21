"use client";

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import ProjectSidebar from '@/components/ProjectSidebar';
import AIDecomposePanel from '@/components/AIDecomposePanel';
import TaskCard, { TaskType } from '@/components/TaskCard';

// Struktur data kolom kita
type ColumnData = {
  [key: string]: {
    title: string;
    items: TaskType[];
  };
};

export default function DashboardPage() {
  // Cegah error Hydration dari Next.js (hanya render DND di sisi Client)
  const [isMounted, setIsMounted] = useState(false);
  
  // State untuk 3 Kolom Kanban
  const [columns, setColumns] = useState<ColumnData>({
    todo: { title: 'TO DO (TUGAS MASUK)', items: [] },
    inProgress: { title: 'IN PROGRESS (DIKERJAKAN)', items: [] },
    done: { title: 'DONE (SELESAI)', items: [] }
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fungsi saat AI melempar tugas baru
  const handleAddTasksFromAI = (newTasks: TaskType[]) => {
    setColumns(prev => ({
      ...prev,
      todo: {
        ...prev.todo,
        items: [...prev.todo.items, ...newTasks] // Masukkan ke kolom TO DO
      }
    }));
  };

  // Fungsi inti: Menangani logika saat kartu ditarik & dilepas
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return; // Kalau dilepas di luar area, batalkan
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      // Pindah kolom
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems }
      });
    } else {
      // Pindah urutan di dalam kolom yang sama
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems }
      });
    }
  };

  if (!isMounted) return null; // Render kosong dulu sepersekian detik biar aman

  return (
    <div className="h-screen w-screen bg-neutral-950 flex overflow-hidden font-sans">
      <ProjectSidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-neutral-900/50 border-b border-neutral-800 p-5 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-lg font-bold text-white">Capstone MVP</h1>
            <p className="text-xs text-neutral-400">Diperbarui secara real-time</p>
          </div>
          <button className="px-4 py-1.5 bg-neutral-800 text-sm text-white rounded-md border border-neutral-700 hover:bg-neutral-700 transition-colors">
            Share Room
          </button>
        </header>

        <div className="flex-1 overflow-hidden p-6 flex gap-6">
          
          {/* AREA KANBAN BOARD */}
          <div className="flex-1 flex gap-4 overflow-x-auto custom-scrollbar">
            <DragDropContext onDragEnd={onDragEnd}>
              {Object.entries(columns).map(([columnId, column]) => (
                <div key={columnId} className="w-80 flex-shrink-0 flex flex-col bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-4 overflow-hidden h-full">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">{column.title}</h2>
                    <span className="bg-neutral-800 text-neutral-400 text-xs px-2 py-1 rounded-full">{column.items.length}</span>
                  </div>
                  
                  {/* Area Drop (Tempat naruh kartu) */}
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 overflow-y-auto pr-1 pb-4 custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-neutral-800/20 rounded-lg' : ''}`}
                      >
                        {column.items.length === 0 && !snapshot.isDraggingOver && (
                           <div className="h-full flex items-center justify-center text-neutral-600 text-xs border-2 border-dashed border-neutral-800 rounded-lg">
                             Kosong
                           </div>
                        )}
                        {column.items.map((task, index) => (
                          <TaskCard key={task.id} task={task} index={index} />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </DragDropContext>
          </div>

          {/* AREA AI PANEL */}
          <div className="w-[350px] shrink-0 h-full">
            <AIDecomposePanel onAcceptTasks={handleAddTasksFromAI} />
          </div>

        </div>
      </main>
    </div>
  );
}