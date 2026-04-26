import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/ai/client";
import { RECOMMEND_PROMPT } from "@/lib/ai/prompts";
import { parseAIJson } from "@/lib/ai/parsers";
import type { AIMemberRecommendation } from "@/types";

const schema = z.object({
  projectId: z.string().uuid(),
  taskIds: z.array(z.string().uuid()).min(1),
});

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY belum dikonfigurasi di server." }, { status: 500 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as unknown;
    const input = schema.parse(body);

    const { data: project } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", input.projectId)
      .single();
    if (project?.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const service = createServiceClient();
    const { data: tasks } = await service
      .from("tasks")
      .select("id, title, required_skills, estimated_hours, priority")
      .in("id", input.taskIds);

    const { data: members } = await service
      .from("project_members")
      .select("user_id, profiles(id, full_name, skills, available_hours)")
      .eq("project_id", input.projectId);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: RECOMMEND_PROMPT(tasks ?? [], members ?? []),
        },
      ],
    });

    const result = parseAIJson<{ recommendations: AIMemberRecommendation[] }>(message);

    const suggestionRows = result.recommendations.map((r) => ({
      project_id: input.projectId,
      type: "recommendation" as const,
      title: `Rekomendasi penugasan untuk task`,
      body: r.reason,
      metadata: { taskId: r.taskId, userId: r.userId, score: r.score },
    }));

    await service.from("ai_suggestions").insert(suggestionRows);

    return NextResponse.json({ data: result.recommendations });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[AI Recommend Error]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
