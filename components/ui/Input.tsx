import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({ label, error, hint, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "var(--c-muted)" }}
        >
          {label}
          {props.required && <span style={{ color: "var(--c-red)" }}> *</span>}
        </label>
      )}
      <input
        className={`w-full rounded-lg px-3 py-2 text-sm transition-all input-field ${className}`}
        style={{
          background: "var(--c-raised)",
          border: error ? "1px solid var(--c-red)" : "1px solid var(--c-border)",
          color: "var(--c-text)",
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs flex items-center gap-1" style={{ color: "var(--c-red)" }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs" style={{ color: "var(--c-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
