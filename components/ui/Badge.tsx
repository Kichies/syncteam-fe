interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "backlog" | "in_progress" | "completed" | "danger";
}

const variantClass: Record<string, string> = {
  default: "bg-neutral-800 text-neutral-300",
  gold: "bg-[#C9A96E]/20 text-[#C9A96E]",
  backlog: "bg-[#6B7280]/20 text-[#6B7280]",
  in_progress: "bg-[#F59E0B]/20 text-[#F59E0B]",
  completed: "bg-[#10B981]/20 text-[#10B981]",
  danger: "bg-[#EF4444]/20 text-[#EF4444]",
};

export default function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${variantClass[variant]}`}
    >
      {children}
    </span>
  );
}
