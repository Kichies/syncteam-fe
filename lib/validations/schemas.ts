import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
});

export const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Nama minimal 2 karakter" })
    .max(100),
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
});

export const profileSetupSchema = z.object({
  role: z.string().min(2).max(100),
  skills: z.array(z.string()).min(1, { message: "Pilih minimal 1 skill" }),
  available_hours: z.number().int().min(1).max(40),
});

export const createProjectSchema = z
  .object({
    name: z.string().min(3).max(100),
    description: z.string().max(500).optional(),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format: YYYY-MM-DD" }),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format: YYYY-MM-DD" }),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date harus setelah start date",
    path: ["end_date"],
  });

export const createTaskSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(["backlog", "in_progress", "completed"]).default("backlog"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assigned_to: z.string().uuid().optional(),
  estimated_hours: z.number().int().positive().optional(),
  due_date: z.string().optional(),
  required_skills: z.array(z.string()).default([]),
});
