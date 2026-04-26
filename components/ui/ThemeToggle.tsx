"use client";
import { useTheme, type Theme } from "@/app/providers";

const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: "obsidian", label: "Obsidian (Dark Gold)", color: "#C9A96E" },
  { id: "midnight", label: "Midnight (Dark Blue)", color: "#5B8DEF" },
  { id: "forest",   label: "Forest (Dark Green)",  color: "#34D399" },
  { id: "dawn",     label: "Dawn (Light)",          color: "#7C3AED" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1.5">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className="w-4 h-4 rounded-full transition-all duration-150 hover:scale-125 focus:outline-none"
          style={{
            background: t.color,
            boxShadow: theme === t.id ? `0 0 0 2px var(--c-surface), 0 0 0 3.5px ${t.color}` : "none",
          }}
        />
      ))}
    </div>
  );
}
