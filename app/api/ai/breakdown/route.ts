import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getGroq, GROQ_MODEL } from "@/lib/ai/client";
import { BREAKDOWN_PROMPT } from "@/lib/ai/prompts";
import { parseAIJson } from "@/lib/ai/parsers";
import type { AIBreakdownTask, ProjectMember } from "@/types";

const schema = z.object({
  projectId: z.string().uuid(),
  description: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY belum dikonfigurasi di server." }, { status: 500 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as unknown;
    const input = schema.parse(body);

    const { data: membership } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", input.projectId)
      .eq("user_id", user.id)
      .single();

    const { data: project } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", input.projectId)
      .single();

    if (!membership && project?.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const service = createServiceClient();
    const { data: members } = await service
      .from("project_members")
      .select("id, user_id, role_in_project, profiles(id, full_name, skills, available_hours)")
      .eq("project_id", input.projectId);

    const completion = await getGroq().chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: BREAKDOWN_PROMPT(input.description, (members ?? []) as ProjectMember[]),
        },
      ],
    });

    const result = parseAIJson<{ tasks: AIBreakdownTask[] }>(completion);

    const taskRows = result.tasks.map((t, i) => ({
      project_id: input.projectId,
      title: t.title,
      description: t.description,
      estimated_hours: t.estimatedHours,
      required_skills: t.requiredSkills,
      priority: t.priority,
      status: "backlog" as const,
      ai_generated: true,
      order_index: i,
    }));

    const { data: inserted, error: insertError } = await service
      .from("tasks")
      .insert(taskRows)
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({ data: inserted });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[AI Breakdown Error]", msg);
    return NextResponse.json({ error: "Gagal generate tasks. Coba lagi." }, { status: 500 });
  }
}
