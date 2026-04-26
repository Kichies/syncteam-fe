import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getGroq, GROQ_MODEL } from "@/lib/ai/client";
import { ROADMAP_PROMPT } from "@/lib/ai/prompts";
import { parseAIJson } from "@/lib/ai/parsers";
import type { Json } from "@/lib/supabase/types";

const schema = z.object({
  projectId: z.string().uuid(),
});

interface SprintData {
  sprintNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  focus: string;
  milestones: string[];
  suggestedTasks: {
    title: string;
    estimatedHours: number;
    requiredSkills: string[];
    priority: string;
  }[];
}

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

    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", input.projectId)
      .single();
    if (!project || project.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const service = createServiceClient();
    const { data: members } = await service
      .from("project_members")
      .select("user_id, profiles(id, full_name, skills, available_hours, role)")
      .eq("project_id", input.projectId);

    const completion = await getGroq().chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: ROADMAP_PROMPT(project, members ?? []),
        },
      ],
    });

    const result = parseAIJson<{
      sprints: SprintData[];
      totalEstimatedHours: number;
      riskFactors: string[];
    }>(completion);

    await service.from("roadmaps").insert({
      project_id: input.projectId,
      content: result as unknown as Json,
    });

    const sprintRows = result.sprints.map((s) => ({
      project_id: input.projectId,
      sprint_number: s.sprintNumber,
      name: s.name,
      start_date: s.startDate,
      end_date: s.endDate,
      status: "active" as const,
    }));

    await service.from("sprints").insert(sprintRows);

    await service
      .from("projects")
      .update({ sprint_count: result.sprints.length })
      .eq("id", input.projectId);

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[AI Roadmap Error]", msg);
    return NextResponse.json({ error: "Gagal generate roadmap. Coba lagi." }, { status: 500 });
  }
}
