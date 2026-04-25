import type { ProjectMember } from "@/types";

export const BREAKDOWN_PROMPT = (
  description: string,
  members: ProjectMember[],
) => `
Kamu adalah AI assistant manajemen proyek mahasiswa Teknik Informatika.
Breakdown tugas ini menjadi sub-tasks yang bisa dikerjakan individual:

DESKRIPSI: ${description}

ANGGOTA TIM:
${members.map((m) => `- ${m.profiles?.full_name}: skills=[${m.profiles?.skills?.join(", ")}], tersedia=${m.profiles?.available_hours}jam/minggu`).join("\n")}

Respond HANYA dengan JSON valid (tanpa markdown, tanpa penjelasan):
{"tasks":[{"title":"string max 80 char","description":"string","estimatedHours":number,"requiredSkills":["skill"],"priority":"low|medium|high"}]}
`;

export const RECOMMEND_PROMPT = (tasks: unknown[], members: unknown[]) => `
Rekomendasikan penugasan optimal. Bobot: skills 50%, ketersediaan 30%, pemerataan beban 20%.
TASKS: ${JSON.stringify(tasks)}
ANGGOTA: ${JSON.stringify(members)}
Respond HANYA JSON: {"recommendations":[{"taskId":"uuid","userId":"uuid","score":0-100,"reason":"alasan singkat"}]}
`;

export const ROADMAP_PROMPT = (project: unknown, members: unknown[]) => `
Buat roadmap sprint untuk proyek mahasiswa. Sistem XP: selesai awal +10, tepat waktu +5, telat 1-3hr -5, telat >3hr -15.
PROYEK: ${JSON.stringify(project)}
ANGGOTA: ${JSON.stringify(members)}
Respond HANYA JSON: {"sprints":[{"sprintNumber":1,"name":"string","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","focus":"string","milestones":["string"],"suggestedTasks":[{"title":"string","estimatedHours":number,"requiredSkills":["skill"],"priority":"low|medium|high"}]}],"totalEstimatedHours":number,"riskFactors":["string"]}
`;
