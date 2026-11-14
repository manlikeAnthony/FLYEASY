import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "orange";
  loading?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  loading,
  className = "",
  style: customStyle,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-5 py-3 rounded-lg text-sm font-semibold transition-default hover:-translate-y-0.5 disabled:hover:translate-y-0";
  // map variant to inline style using CSS variables (single source of truth)
  const style: React.CSSProperties = {};
  if (variant === "primary") {
    style.backgroundColor = "var(--accent)";
    style.color = "white";
  } else if (variant === "orange") {
    style.backgroundColor = "var(--accent-2)";
    style.color = "white";
  } else if (variant === "outline") {
    style.backgroundColor = "var(--card-bg)";
    style.color = "var(--text)";
    style.borderColor = "var(--border)";
    style.borderStyle = "solid";
    style.borderWidth = 1;
  } else if (variant === "ghost") {
    style.backgroundColor = "transparent";
    style.color = "var(--accent)";
  }

  return (
    <button
      className={`${base} ${className}`}
      style={{ ...style, ...customStyle }}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
