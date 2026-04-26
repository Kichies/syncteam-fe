import type Groq from "groq-sdk";

export function parseAIJson<T>(completion: Groq.Chat.ChatCompletion): T {
  const text = completion.choices[0]?.message?.content ?? "";
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `AI response bukan valid JSON: ${cleaned.substring(0, 200)}`,
    );
  }
}
