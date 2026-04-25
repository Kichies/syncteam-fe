import { ButtonHTMLAttributes } from "react";
import Spinner from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClass: Record<string, string> = {
  primary:
    "bg-[#C9A96E] text-[#0E0E0F] font-bold hover:bg-[#b8935a] shadow-lg shadow-[#C9A96E]/20",
  secondary:
    "bg-[#2A2A2B] text-[#F5F4F0] font-semibold hover:bg-neutral-700 border border-[#2A2A2B]",
  ghost: "text-[#9CA3AF] hover:text-[#F5F4F0] hover:bg-[#2A2A2B]",
  danger: "bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30 border border-[#EF4444]/30",
};

const sizeClass: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2.5 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
