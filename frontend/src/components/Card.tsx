import React from "react";

export default function Card({
  children,
  className = "",
  skeleton = false,
}: {
  children?: React.ReactNode;
  className?: string;
  skeleton?: boolean;
}) {
  if (skeleton) {
    return (
      <div
        className={`rounded-2xl shadow-md p-6 ${className}`}
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
      >
        <div className="space-y-3">
          <div
            className="h-4 rounded w-3/4 animate-pulse"
            style={{ backgroundColor: "var(--border)" }}
          />
          <div
            className="h-4 rounded w-1/2 animate-pulse"
            style={{ backgroundColor: "var(--border)" }}
          />
          <div
            className="h-3 rounded w-2/3 animate-pulse"
            style={{ backgroundColor: "var(--border)" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl shadow-md p-6 ${className}`}
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border)",
        color: "var(--text)",
      }}
    >
      {children}
    </div>
  );
}
