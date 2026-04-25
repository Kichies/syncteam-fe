"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TaskType } from '@/components/TaskCard';

// ── Types ──────────────────────────────────────────────────────────────────
export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;   // bg color untuk avatar
  online: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export type ColumnData = {
  [key: string]: {
    title: string;
    indicator: string;
    items: TaskType[];
  };
};

// Per-project data: members + columns
interface ProjectData {
  members: Member[];
  columns: ColumnData;
}

interface ProjectContextValue {
  projects: Project[];
  activeProjectId: string;
  projectData: Record<string, ProjectData>;   // keyed by project id
  activeData: ProjectData;                     // shortcut ke data project aktif
  setActiveProject: (id: string) => void;
  addProject: (name: string, description: string) => void;
  addMember: (name: string) => void;
  removeMember: (memberId: string) => void;
  setColumns: (columns: ColumnData) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: '#3a3060', text: '#a89ee0' },
  { bg: '#1e3a4a', text: '#6bbcd4' },
  { bg: '#3a2020', text: '#c47a88' },
  { bg: '#1e3a2a', text: '#7aaa8a' },
  { bg: '#3a3020', text: '#d4a060' },
  { bg: '#2a1e3a', text: '#b47acc' },
];

function makeInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const INITIAL_PROJECT: Project = { id: 'proj-1', name: 'Capstone MVP', description: 'Project capstone utama tim.' };

const makeInitialData = (): ProjectData => ({
  members: [],
  columns: {
    todo:       { title: 'TO DO (TUGAS MASUK)',      indicator: '#3d3d42', items: [] },
    inProgress: { title: 'IN PROGRESS (DIKERJAKAN)', indicator: '#c9a96e', items: [] },
    done:       { title: 'DONE (SELESAI)',            indicator: '#5a8a6a', items: [] },
  },
});

// ── Context ────────────────────────────────────────────────────────────────
const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([INITIAL_PROJECT]);
  const [activeProjectId, setActiveProjectId] = useState(INITIAL_PROJECT.id);
  const [projectData, setProjectData] = useState<Record<string, ProjectData>>({
    [INITIAL_PROJECT.id]: makeInitialData(),
  });

  const activeData: ProjectData = projectData[activeProjectId] ?? makeInitialData();

  // ── Switch project ─────────────────────────────────────────────────────
  const setActiveProject = useCallback((id: string) => {
    setActiveProjectId(id);
  }, []);

  // ── Add new project ────────────────────────────────────────────────────
  const addProject = useCallback((name: string, description: string) => {
    const newProject: Project = { id: `proj-${makeId()}`, name, description };
    setProjects(prev => [...prev, newProject]);
    setProjectData(prev => ({
      ...prev,
      [newProject.id]: makeInitialData(),
    }));
    setActiveProjectId(newProject.id);
  }, []);

  // ── Add member (scoped to active project) ─────────────────────────────
  const addMember = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = activeData.members;
    const colorIdx = existing.length % AVATAR_COLORS.length;
    const newMember: Member = {
      id: `mem-${makeId()}`,
      name: trimmed,
      initials: makeInitials(trimmed),
      color: AVATAR_COLORS[colorIdx].bg,
      online: true,
    };
    setProjectData(prev => ({
      ...prev,
      [activeProjectId]: {
        ...prev[activeProjectId],
        members: [...(prev[activeProjectId]?.members ?? []), newMember],
      },
    }));
  }, [activeProjectId, activeData.members]);

  // ── Remove member ──────────────────────────────────────────────────────
  const removeMember = useCallback((memberId: string) => {
    setProjectData(prev => ({
      ...prev,
      [activeProjectId]: {
        ...prev[activeProjectId],
        members: prev[activeProjectId].members.filter(m => m.id !== memberId),
      },
    }));
  }, [activeProjectId]);

  // ── Update columns (tasks) ─────────────────────────────────────────────
  const setColumns = useCallback((columns: ColumnData) => {
    setProjectData(prev => ({
      ...prev,
      [activeProjectId]: { ...prev[activeProjectId], columns },
    }));
  }, [activeProjectId]);

  return (
    <ProjectContext.Provider value={{
      projects, activeProjectId, projectData, activeData,
      setActiveProject, addProject, addMember, removeMember, setColumns,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used inside <ProjectProvider>');
  return ctx;
}