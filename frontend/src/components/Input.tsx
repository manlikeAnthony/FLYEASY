import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | boolean;
};

export default function Input({
  label,
  error,
  className = "",
  ...props
}: Props) {
  return (
    <label className="block text-sm" style={{ color: "var(--text)" }}>
      {label && <span className="mb-1 block font-medium">{label}</span>}
      <input
        {...props}
        className={`w-full px-3 py-2 rounded-lg focus:outline-none border ${className}`}
        style={{
          backgroundColor: "var(--input-bg)",
          color: "var(--input-text)",
          borderColor: "var(--border)",
        }}
      />
      {error && (
        <span className="text-xs mt-1 block" style={{ color: "var(--error)" }}>
          {error}
        </span>
      )}
    </label>
  );
}
