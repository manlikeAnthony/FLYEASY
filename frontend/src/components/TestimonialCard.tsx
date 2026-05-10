type TestimonialCardProps = {
  name: string;
  role: string;
  location: string;
  message: string;
  avatarInitials: string;
};

export default function TestimonialCard({
  name,
  role,
  location,
  message,
  avatarInitials,
}: TestimonialCardProps) {
  // Avatar colors - theme aware
  const avatarBgColors = [
    "rgba(59, 130, 246, 0.1)",
    "rgba(147, 51, 234, 0.1)",
    "rgba(236, 72, 153, 0.1)",
    "rgba(16, 185, 129, 0.1)",
    "rgba(251, 146, 60, 0.1)",
    "rgba(99, 102, 241, 0.1)",
  ];

  const avatarTextColors = [
    "#3b82f6",
    "#9333ea",
    "#ec4899",
    "#10b981",
    "#fb923c",
    "#6366f1",
  ];

  const colorIndex = name.charCodeAt(0) % avatarBgColors.length;

  return (
    <div
      className="p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border)",
        border: "1px solid",
      }}
    >
      {/* Star Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            style={{ color: "var(--accent-2)", fontSize: "1.2rem" }}
          >
            ★
          </span>
        ))}
      </div>

      {/* Message */}
      <p
        className="text-sm leading-relaxed mb-6 italic"
        style={{ color: "var(--text)" }}
      >
        "{message}"
      </p>

      {/* Avatar + User Info */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg"
          style={{
            backgroundColor: avatarBgColors[colorIndex],
            color: avatarTextColors[colorIndex],
          }}
        >
          {avatarInitials}
        </div>
        <div>
          <p className="font-semibold" style={{ color: "var(--text)" }}>
            {name}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {role} • {location}
          </p>
        </div>
      </div>
    </div>
  );
}
