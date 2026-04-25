import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs text-[#9CA3AF] font-bold mb-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-[#1A1A1B] border rounded-lg p-3 text-[#F5F4F0] placeholder-[#9CA3AF]/50 focus:outline-none transition-colors ${
          error
            ? "border-[#EF4444] focus:border-[#EF4444]"
            : "border-[#2A2A2B] focus:border-[#C9A96E]"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}
