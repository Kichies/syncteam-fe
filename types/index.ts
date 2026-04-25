export type TaskStatus = "backlog" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type SuggestionType =
  | "reorder"
  | "workload"
  | "deadline"
  | "recommendation";
export type RewardType = "reward" | "punishment";
export type ProjectStatus = "active" | "completed" | "archived";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role?: string;
  skills: string[];
  available_hours: number;
  xp_points: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  sprint_count: number;
  created_at: string;
  owner?: Profile;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role_in_project?: string;
  joined_at: string;
  profiles?: Profile;
}

export interface Task {
  id: string;
  project_id: string;
  sprint_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  required_skills: string[];
  due_date?: string;
  completed_at?: string;
  parent_task_id?: string;
  ai_generated: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  assignee?: Profile;
}

export interface AISuggestion {
  id: string;
  project_id: string;
  type: SuggestionType;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  is_accepted?: boolean;
  created_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  sprint_number: number;
  name?: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed";
  progress_snapshot: number;
}

export interface RewardHistory {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  type: RewardType;
  points: number;
  reason?: string;
  created_at: string;
}

export interface AIBreakdownTask {
  title: string;
  description: string;
  estimatedHours: number;
  requiredSkills: string[];
  priority: TaskPriority;
}

export interface AIMemberRecommendation {
  taskId: string;
  userId: string;
  score: number;
  reason: string;
}
