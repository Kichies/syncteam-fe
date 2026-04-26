interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "backlog" | "in_progress" | "completed" | "danger";
}

const STYLES: Record<string, { bg: string; color: string; border: string }> = {
  default:     { bg: "rgba(255,255,255,0.06)", color: "var(--c-muted)",  border: "rgba(255,255,255,0.08)" },
  gold:        { bg: "var(--c-accent-bg)",     color: "var(--c-accent)", border: "var(--c-accent-bd)" },
  backlog:     { bg: "rgba(136,136,136,0.10)", color: "var(--c-muted)",  border: "rgba(136,136,136,0.15)" },
  in_progress: { bg: "rgba(245,158,11,0.10)",  color: "var(--c-amber)",  border: "rgba(245,158,11,0.20)" },
  completed:   { bg: "rgba(34,197,94,0.10)",   color: "var(--c-green)",  border: "rgba(34,197,94,0.20)" },
  danger:      { bg: "var(--c-red-bg)",         color: "var(--c-red)",    border: "rgba(239,68,68,0.20)" },
};

export default function Badge({ children, variant = "default" }: BadgeProps) {
  const s = STYLES[variant] ?? STYLES.default;
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {children}
    </span>
  );
}
