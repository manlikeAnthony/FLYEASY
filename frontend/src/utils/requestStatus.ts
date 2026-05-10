export type BackendStatus = "pending" | "processing" | "completed" | "rejected";

type StatusBadge = {
  label: string;
  classes: string; // Tailwind utility classes for badge background + text
};

export function getStatusBadge(status?: string, user?: any): StatusBadge {
  // Normalize
  const s = typeof status === "string" ? status.toLowerCase() : "";

  if (s === "pending") {
    if (user) {
      return { label: "Claimed", classes: "bg-amber-100 text-amber-800" };
    }
    return { label: "Open", classes: "bg-yellow-100 text-yellow-800" };
  }

  if (s === "processing") {
    return { label: "Processing", classes: "bg-blue-100 text-blue-800" };
  }

  if (s === "completed") {
    return { label: "Completed", classes: "bg-green-100 text-green-800" };
  }

  if (s === "rejected") {
    return { label: "Rejected", classes: "bg-red-100 text-red-800" };
  }

  return { label: "Unknown", classes: "bg-gray-100 text-gray-800" };
}

export function getNextStatus(current?: string): BackendStatus {
  const s = typeof current === "string" ? current.toLowerCase() : "";
  if (s === "pending") return "processing";
  if (s === "processing") return "completed";
  return (s as BackendStatus) || "pending";
}
