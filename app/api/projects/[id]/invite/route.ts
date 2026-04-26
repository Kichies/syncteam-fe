import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const schema = z
  .object({
    email: z.string().email("Email tidak valid").optional(),
    github_username: z.string().min(1).max(39).optional(),
  })
  .refine((d) => d.email ?? d.github_username, {
    message: "Email atau GitHub username harus diisi.",
  });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: project } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", projectId)
      .single();

    if (!project || project.owner_id !== user.id) {
      return NextResponse.json({ error: "Hanya owner yang bisa mengundang anggota." }, { status: 403 });
    }

    const body = await req.json() as unknown;
    const input = schema.parse(body);

    const service = createServiceClient();

    let targetUserId: string | null = null;

    if (input.email) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (service as any).rpc("get_user_id_by_email", {
        user_email: input.email,
      }) as { data: string | null };
      targetUserId = data;
    } else if (input.github_username) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (service as any).rpc("get_user_id_by_github", {
        github_username: input.github_username,
      }) as { data: string | null };
      targetUserId = data;
    }

    if (!targetUserId) {
      const identifier = input.email ?? `@${input.github_username}`;
      return NextResponse.json(
        { error: `Pengguna "${identifier}" tidak ditemukan. Pastikan mereka sudah mendaftar di SyncTeam.` },
        { status: 404 },
      );
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: "Kamu tidak bisa mengundang diri sendiri." }, { status: 400 });
    }

    const { data: existing } = await service
      .from("project_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", targetUserId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Pengguna ini sudah menjadi anggota proyek." }, { status: 409 });
    }

    const { data: profile } = await service
      .from("profiles")
      .select("full_name")
      .eq("id", targetUserId)
      .single();

    const { error: insertError } = await service.from("project_members").insert({
      project_id: projectId,
      user_id: targetUserId,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const displayName = profile?.full_name ?? input.email ?? `@${input.github_username}`;
    return NextResponse.json({
      data: {
        userId: targetUserId,
        fullName: displayName,
        message: `${displayName} berhasil ditambahkan ke proyek.`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[Invite Member Error]", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
