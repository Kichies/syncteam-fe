"use client";

import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import ProjectSidebar from '@/components/ProjectSidebar';
import AIDecomposePanel from '@/components/AIDecomposePanel';
import TaskCard, { TaskType } from '@/components/TaskCard';
import { useProject } from '@/app/context/ProjectContext';

type Priority = 'Tinggi' | 'Sedang' | 'Rendah';

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; bg: string; border: string }[] = [
  { value: 'Tinggi', label: 'Tinggi', color: '#c47a88', bg: 'rgba(160,80,96,0.15)', border: '#a05060' },
  { value: 'Sedang', label: 'Sedang', color: '#d4a060', bg: 'rgba(196,135,58,0.15)', border: '#c4873a' },
  { value: 'Rendah', label: 'Rendah', color: '#7aaa8a', bg: 'rgba(90,138,106,0.15)', border: '#5a8a6a' },
];

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { activeData, setColumns, projects, activeProjectId } = useProject();

  // Modal Add Task
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle]         = useState('');
  const [taskPriority, setTaskPriority]   = useState<Priority>('Sedang');
  const [taskCreatedBy, setTaskCreatedBy] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskEstHours, setTaskEstHours]   = useState('');

  useEffect(() => { setIsMounted(true); }, []);

  const columns = activeData.columns;
  const members = activeData.members;

  // ── Sprint progress ──────────────────────────────────────────────────────
  const sprint = useMemo(() => {
    const doneCt       = columns.done?.items.length ?? 0;
    const inProgressCt = columns.inProgress?.items.length ?? 0;
    const todoCt       = columns.todo?.items.length ?? 0;
    const total        = doneCt + inProgressCt + todoCt;
    const pct = total === 0
      ? 0
      : Math.round(((doneCt * 1 + inProgressCt * 0.5) / total) * 100);
    return { doneCt, inProgressCt, todoCt, total, pct };
  }, [columns]);

  // Active project name
  const activeProject = projects.find(p => p.id === activeProjectId);

  // ── Add task from AI ─────────────────────────────────────────────────────
  const handleAddTasksFromAI = (newTasks: TaskType[]) => {
    setColumns({
      ...columns,
      todo: { ...columns.todo, items: [...columns.todo.items, ...newTasks] },
    });
  };

  // ── Add task from modal ───────────────────────────────────────────────────
  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    const newTask: TaskType = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      priority: taskPriority,
      estHours: taskEstHours ? parseFloat(taskEstHours) : 0,
      createdBy: taskCreatedBy.trim() || undefined,
      assignedTo: taskAssignedTo || undefined,
    };
    setColumns({
      ...columns,
      todo: { ...columns.todo, items: [...columns.todo.items, newTask] },
    });
    resetForm();
  };

  const resetForm = () => {
    setTaskTitle('');
    setTaskPriority('Sedang');
    setTaskCreatedBy('');
    setTaskAssignedTo('');
    setTaskEstHours('');
    setIsAddTaskOpen(false);
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) {
      const srcCol   = columns[source.droppableId];
      const dstCol   = columns[destination.droppableId];
      const srcItems = [...srcCol.items];
      const dstItems = [...dstCol.items];
      const [removed] = srcItems.splice(source.index, 1);
      dstItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: { ...srcCol, items: srcItems },
        [destination.droppableId]: { ...dstCol, items: dstItems },
      });
    } else {
      const col   = columns[source.droppableId];
      const items = [...col.items];
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: { ...col, items } });
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <style>{`
        .btn-add-task {
          padding: 7px 18px;
          border-radius: 7px;
          background: var(--gold);
          border: none;
          color: var(--black);
          font-size: 0.75rem;
          font-weight: 600;
          font-family: var(--font-body);
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .btn-add-task:hover {
          background: #dbb97a;
          box-shadow: 0 0 16px rgba(201,169,110,0.45);
          transform: translateY(-1px);
        }
        .progress-fill-bar {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, var(--gold) 0%, #e8c47a 100%);
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kanban-scroll {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          overflow-y: hidden;
          height: 100%;
          padding-bottom: 12px;
        }
        .kanban-scroll::-webkit-scrollbar { height: 4px; }
        .kanban-scroll::-webkit-scrollbar-track { background: transparent; }
        .kanban-scroll::-webkit-scrollbar-thumb { background: var(--grey-muted); border-radius: 99px; }
        .col-scroll::-webkit-scrollbar { width: 3px; }
        .col-scroll::-webkit-scrollbar-track { background: transparent; }
        .col-scroll::-webkit-scrollbar-thumb { background: var(--grey-muted); border-radius: 99px; }
        .left-scroll::-webkit-scrollbar { width: 3px; }
        .left-scroll::-webkit-scrollbar-track { background: transparent; }
        .left-scroll::-webkit-scrollbar-thumb { background: var(--grey-muted); border-radius: 99px; }

        /* Modal input */
        .modal-input {
          width: 100%;
          background: var(--black);
          border: 1px solid rgba(245,244,240,0.12);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--white);
          font-size: 0.85rem;
          outline: none;
          font-family: var(--font-body);
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .modal-input:focus { border-color: var(--gold); }
        .modal-label {
          display: block;
          font-size: 0.62rem;
          color: var(--white-dim);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 500;
          margin-bottom: 7px;
        }
      `}</style>

      <div style={{
        height: '100vh', width: '100vw',
        display: 'flex', overflow: 'hidden',
        background: 'var(--black)', fontFamily: 'var(--font-body)',
      }}>
        <ProjectSidebar />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', minWidth: 0 }}>

          {/* ── TOP HEADER ── */}
          <header style={{
            padding: '14px 28px',
            background: 'var(--grey-deep)',
            borderBottom: '1px solid rgba(245,244,240,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--white-dim)' }}>
              <span style={{ color: 'var(--white)', fontWeight: 500 }}>
                {activeProject?.name ?? 'SyncTeam'}
              </span>
              <span style={{ color: 'var(--grey-muted)' }}>/</span>
              <span>Task Board</span>
            </div>
            <button style={{
              padding: '7px 16px',
              background: 'var(--grey-mid)',
              border: '1px solid rgba(245,244,240,0.1)',
              borderRadius: '7px',
              color: 'var(--white-dim)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}>
              Share Room
            </button>
          </header>

          {/* ── BODY ── */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

            {/* ── KIRI ── */}
            <div
              className="left-scroll"
              style={{
                flex: 1, minWidth: 0,
                overflowY: 'auto', overflowX: 'hidden',
                padding: '24px 24px 0 28px',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Project Title */}
              <div style={{ marginBottom: '18px', flexShrink: 0 }}>
                <p style={{
                  fontSize: '0.65rem', fontWeight: 500,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: 'var(--gold)', marginBottom: '6px',
                }}>
                  {activeProject?.name ?? 'SyncTeam'}
                </p>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem', fontWeight: 500,
                  color: 'var(--white)', marginBottom: '8px', lineHeight: 1.1,
                }}>
                  {activeProject?.name ?? 'Capstone MVP'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: 'var(--white-dim)' }}>
                  <span>Diperbarui secara real-time</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--grey-muted)', display: 'inline-block' }} />
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.25)',
                    borderRadius: '4px', padding: '2px 8px',
                    fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--gold)',
                  }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
                    AI Active
                  </span>
                </div>
              </div>

              {/* Sprint Progress */}
              <div style={{
                background: 'var(--grey-deep)',
                border: '1px solid rgba(245,244,240,0.08)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--white-dim)' }}>
                    Sprint Progress
                  </span>
                  <span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', color: 'var(--white)', lineHeight: 1 }}>
                      {sprint.pct}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--white-dim)', marginLeft: '4px' }}>% complete</span>
                  </span>
                </div>
                <div style={{ height: '5px', background: 'rgba(245,244,240,0.07)', borderRadius: '99px', marginBottom: '10px' }}>
                  <div className="progress-fill-bar" style={{ width: `${sprint.pct}%` }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    {[
                      { dot: '#5a8a6a', label: `${sprint.doneCt} done` },
                      { dot: '#c9a96e', label: `${sprint.inProgressCt} in progress` },
                      { dot: '#3d3d42', label: `${sprint.todoCt} to do` },
                    ].map(s => (
                      <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--white-dim)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block', flexShrink: 0 }} />
                        {s.label}
                      </span>
                    ))}
                  </div>
                  {sprint.total > 0 && (
                    <span style={{
                      fontSize: '0.65rem',
                      color: sprint.pct === 100 ? '#7ec99a' : 'var(--white-dim)',
                      background: sprint.pct === 100 ? 'rgba(90,138,106,0.12)' : 'transparent',
                      border: sprint.pct === 100 ? '1px solid rgba(90,138,106,0.25)' : 'none',
                      borderRadius: '4px',
                      padding: sprint.pct === 100 ? '2px 8px' : '0',
                      transition: 'all 0.3s',
                    }}>
                      {sprint.pct === 100 ? '✓ Sprint selesai!' : `${sprint.doneCt} dari ${sprint.total} task selesai`}
                    </span>
                  )}
                </div>
              </div>

              {/* Task Board Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '14px', flexShrink: 0,
              }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--white)', fontWeight: 400 }}>
                  Task Board
                </h2>
                <button className="btn-add-task" onClick={() => setIsAddTaskOpen(true)}>
                  + Add Task
                </button>
              </div>

              {/* ── KANBAN ── */}
              <div style={{ flex: 1, minHeight: '400px', paddingBottom: '28px' }}>
                <DragDropContext onDragEnd={onDragEnd}>
                  <div className="kanban-scroll">
                    {Object.entries(columns).map(([columnId, column]) => (
                      <div key={columnId} style={{
                        width: '280px', minWidth: '280px', flexShrink: 0,
                        display: 'flex', flexDirection: 'column',
                        background: 'var(--grey-deep)',
                        border: '1px solid rgba(245,244,240,0.06)',
                        borderRadius: '12px', padding: '14px',
                        maxHeight: '100%', height: 'fit-content', minHeight: '200px',
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          marginBottom: '10px', paddingBottom: '10px',
                          borderBottom: '1px solid rgba(245,244,240,0.05)', flexShrink: 0,
                        }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: column.indicator, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--white-dim)', flex: 1 }}>
                            {column.title}
                          </span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--grey-muted)' }}>
                            {column.items.length}
                          </span>
                        </div>
                        <Droppable droppableId={columnId}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="col-scroll"
                              style={{
                                overflowY: 'auto', overflowX: 'hidden',
                                maxHeight: '420px', minHeight: '100px',
                                borderRadius: '8px', transition: 'background 0.15s',
                                background: snapshot.isDraggingOver ? 'rgba(201,169,110,0.03)' : 'transparent',
                                padding: '2px',
                              }}
                            >
                              {column.items.length === 0 && !snapshot.isDraggingOver && (
                                <div style={{
                                  height: '90px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: '1.5px dashed rgba(245,244,240,0.07)',
                                  borderRadius: '8px', fontSize: '0.72rem', color: 'var(--grey-muted)',
                                }}>
                                  Kosong
                                </div>
                              )}
                              {column.items.map((task, index) => (
                                <TaskCard key={task.id} task={task} index={index} members={members} />
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    ))}
                  </div>
                </DragDropContext>
              </div>
            </div>

            {/* ── KANAN: AI Panel ── */}
            <div style={{
              width: '340px', flexShrink: 0,
              padding: '24px 24px 24px 0',
              height: '100%', boxSizing: 'border-box',
            }}>
              <AIDecomposePanel onAcceptTasks={handleAddTasksFromAI} />
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL ADD TASK ── */}
      {isAddTaskOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) resetForm(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{
            background: 'var(--grey-deep)',
            border: '1px solid rgba(245,244,240,0.1)',
            borderRadius: '16px',
            width: '100%', maxWidth: '440px',
            padding: '28px',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
          }}>
            {/* Header modal */}
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem', fontWeight: 500,
              color: 'var(--white)', marginBottom: '4px',
            }}>
              Tambah Task Baru
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--white-dim)', marginBottom: '24px' }}>
              Task akan masuk ke kolom <span style={{ color: 'var(--white)' }}>Tugas Masuk</span> secara otomatis.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>

              {/* Nama Task */}
              <div>
                <label className="modal-label">Nama Task</label>
                <input
                  autoFocus
                  type="text"
                  className="modal-input"
                  placeholder="Contoh: Buat halaman login"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') resetForm(); }}
                />
              </div>

              {/* Prioritas */}
              <div>
                <label className="modal-label">Prioritas</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {PRIORITY_OPTIONS.map(opt => {
                    const isSelected = taskPriority === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTaskPriority(opt.value)}
                        style={{
                          flex: 1,
                          padding: '8px 0',
                          borderRadius: '8px',
                          border: isSelected ? `1px solid ${opt.border}` : '1px solid rgba(245,244,240,0.1)',
                          background: isSelected ? opt.bg : 'transparent',
                          color: isSelected ? opt.color : 'var(--grey-muted)',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 600 : 400,
                          fontFamily: 'var(--font-body)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dibuat Oleh */}
              <div>
                <label className="modal-label">Dibuat Oleh</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Nama pembuat task"
                  value={taskCreatedBy}
                  onChange={e => setTaskCreatedBy(e.target.value)}
                />
              </div>

              {/* Assign ke anggota */}
              <div>
                <label className="modal-label">Ditugaskan Kepada</label>
                {members.length === 0 ? (
                  <div style={{
                    padding: '10px 14px',
                    background: 'var(--black)',
                    border: '1px solid rgba(245,244,240,0.08)',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: 'var(--grey-muted)',
                    fontStyle: 'italic',
                  }}>
                    Belum ada anggota — tambahkan dulu di sidebar
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {/* Opsi: tidak di-assign */}
                    <button
                      onClick={() => setTaskAssignedTo('')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: !taskAssignedTo ? '1px solid rgba(245,244,240,0.3)' : '1px solid rgba(245,244,240,0.1)',
                        background: !taskAssignedTo ? 'rgba(245,244,240,0.08)' : 'transparent',
                        color: !taskAssignedTo ? 'var(--white)' : 'var(--grey-muted)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-body)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      Tidak ada
                    </button>
                    {members.map((m, i) => {
                      const isSelected = taskAssignedTo === m.name;
                      const AVATAR_COLORS_LOCAL = [
                        { bg: '#3a3060', text: '#a89ee0' },
                        { bg: '#1e3a4a', text: '#6bbcd4' },
                        { bg: '#3a2020', text: '#c47a88' },
                        { bg: '#1e3a2a', text: '#7aaa8a' },
                        { bg: '#3a3020', text: '#d4a060' },
                        { bg: '#2a1e3a', text: '#b47acc' },
                      ];
                      const c = AVATAR_COLORS_LOCAL[i % AVATAR_COLORS_LOCAL.length];
                      return (
                        <button
                          key={m.id}
                          onClick={() => setTaskAssignedTo(m.name)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '5px 10px 5px 6px',
                            borderRadius: '20px',
                            border: isSelected ? `1px solid ${c.text}66` : '1px solid rgba(245,244,240,0.1)',
                            background: isSelected ? `${c.bg}` : 'transparent',
                            color: isSelected ? c.text : 'var(--grey-muted)',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-body)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            background: c.bg, border: `1px solid ${c.text}44`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.48rem', fontWeight: 600, color: c.text,
                          }}>
                            {m.initials}
                          </div>
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Estimasi Jam */}
              <div>
                <label className="modal-label">Estimasi Jam</label>
                <input
                  type="number"
                  className="modal-input"
                  placeholder="Contoh: 4"
                  min="0"
                  step="0.5"
                  value={taskEstHours}
                  onChange={e => setTaskEstHours(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={resetForm}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  background: 'var(--grey-mid)',
                  border: '1px solid rgba(245,244,240,0.1)',
                  color: 'var(--white)', fontSize: '0.82rem',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleAddTask}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  background: taskTitle.trim() ? 'var(--gold)' : 'rgba(201,169,110,0.25)',
                  border: 'none',
                  color: taskTitle.trim() ? 'var(--black)' : 'var(--grey-muted)',
                  fontSize: '0.82rem', fontWeight: 600,
                  cursor: taskTitle.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s',
                }}
              >
                Tambah Task
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}