import type { Message } from "@anthropic-ai/sdk/resources";

export function parseAIJson<T>(message: Message): T {
  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");
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
