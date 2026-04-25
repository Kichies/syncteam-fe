export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          role: string | null;
          skills: string[];
          available_hours: number;
          xp_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          role?: string | null;
          skills?: string[];
          available_hours?: number;
          xp_points?: number;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          role?: string | null;
          skills?: string[];
          available_hours?: number;
          xp_points?: number;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string;
          status: string;
          start_date: string;
          end_date: string;
          sprint_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          owner_id: string;
          status?: string;
          start_date: string;
          end_date: string;
          sprint_count?: number;
        };
        Update: {
          name?: string;
          description?: string | null;
          status?: string;
          start_date?: string;
          end_date?: string;
          sprint_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role_in_project: string | null;
          joined_at: string;
        };
        Insert: {
          project_id: string;
          user_id: string;
          role_in_project?: string | null;
        };
        Update: {
          role_in_project?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          sprint_id: string | null;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          assigned_to: string | null;
          estimated_hours: number | null;
          actual_hours: number | null;
          required_skills: string[];
          due_date: string | null;
          completed_at: string | null;
          parent_task_id: string | null;
          ai_generated: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id: string;
          sprint_id?: string | null;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          estimated_hours?: number | null;
          required_skills?: string[];
          due_date?: string | null;
          parent_task_id?: string | null;
          ai_generated?: boolean;
          order_index?: number;
        };
        Update: {
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          required_skills?: string[];
          due_date?: string | null;
          order_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      sprints: {
        Row: {
          id: string;
          project_id: string;
          sprint_number: number;
          name: string | null;
          start_date: string;
          end_date: string;
          status: string;
          progress_snapshot: number;
          created_at: string;
        };
        Insert: {
          project_id: string;
          sprint_number: number;
          name?: string | null;
          start_date: string;
          end_date: string;
          status?: string;
          progress_snapshot?: number;
        };
        Update: {
          name?: string | null;
          status?: string;
          progress_snapshot?: number;
        };
        Relationships: [
          {
            foreignKeyName: "sprints_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      ai_suggestions: {
        Row: {
          id: string;
          project_id: string;
          type: string;
          title: string;
          body: string;
          metadata: Json;
          is_accepted: boolean | null;
          created_at: string;
        };
        Insert: {
          project_id: string;
          type: string;
          title: string;
          body: string;
          metadata?: Json;
          is_accepted?: boolean | null;
        };
        Update: {
          is_accepted?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      reward_history: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          task_id: string | null;
          type: string;
          points: number;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          project_id?: string | null;
          task_id?: string | null;
          type: string;
          points: number;
          reason?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "reward_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      roadmaps: {
        Row: {
          id: string;
          project_id: string;
          content: Json;
          version: number;
          created_at: string;
        };
        Insert: {
          project_id: string;
          content: Json;
          version?: number;
        };
        Update: {
          content?: Json;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "roadmaps_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
