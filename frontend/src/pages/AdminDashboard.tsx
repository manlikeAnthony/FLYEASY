import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Users,
  FileText,
} from "lucide-react";
import Card from "../components/Card";
import { getAdminMetrics } from "../services/requests";
import { getUserMetrics } from "../services/users";
import { useAuth } from "../contexts/AuthContext";
import { getStatusBadge } from "../utils/requestStatus";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  change?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

function StatCard({
  title,
  value,
  change,
  icon,
  trend = "neutral",
}: StatCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 border">
      <div className="flex items-start justify-between mb-3">
        <div
          className="rounded-lg flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12"
          style={{ backgroundColor: "var(--accent)", color: "white" }}
        >
          {icon}
        </div>
        {change && (
          <div
            className={`text-xs font-semibold px-2 py-1 rounded-md ${
              trend === "up"
                ? "text-green-600 bg-green-100"
                : "text-gray-600 bg-gray-100"
            }`}
          >
            {change}
          </div>
        )}
      </div>

      <h3
        className="text-sm font-medium mb-2"
        style={{ color: "var(--muted)" }}
      >
        {title}
      </h3>

      <div className="text-3xl font-bold" style={{ color: "var(--accent)" }}>
        {value}
      </div>
    </Card>
  );
}

function BarChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end justify-between h-32 gap-1">
      {data.map((item) => {
        const height = (item.count / maxCount) * 100;
        return (
          <div
            key={item.date}
            className="flex-1 flex flex-col items-center group"
          >
            <div
              className="w-full rounded-t transition-all group-hover:opacity-80"
              style={{
                height: `${height}%`,
                backgroundColor: "var(--accent)",
                minHeight: item.count === 0 ? 2 : undefined,
              }}
            />
            <span
              className="text-xs mt-2 text-center truncate"
              style={{ color: "var(--muted)" }}
            >
              {item.date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatusDistribution({
  pending,
  processing,
  completed,
  rejected,
}: {
  pending: number;
  processing: number;
  completed: number;
  rejected: number;
}) {
  const total = pending + processing + completed + rejected;
  const statuses = [
    { label: "Pending", count: pending, color: "#f59e0b" },
    { label: "Processing", count: processing, color: "#3b82f6" },
    { label: "Completed", count: completed, color: "#10b981" },
    { label: "Rejected", count: rejected, color: "#ef4444" },
  ];

  return (
    <div className="space-y-3">
      {statuses.map((status) => {
        const percentage = total === 0 ? 0 : (status.count / total) * 100;
        return (
          <div key={status.label}>
            <div className="flex justify-between items-center mb-1">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text)" }}
              >
                {status.label}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: status.color }}
              >
                {status.count}
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--border)" }}
            >
              <div
                className="h-full transition-all"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: status.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: reqMetricsData, isLoading: reqLoading } = useQuery({
    queryKey: ["admin-requests-metrics"],
    queryFn: () => getAdminMetrics(14),
    enabled: !!user && user.role === "ADMIN",
  });

  const { data: userMetricsData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users-metrics"],
    queryFn: () => getUserMetrics(14),
    enabled: !!user && user.role === "ADMIN",
  });

  const metrics = reqMetricsData?.data ?? {};
  const usersMetrics = userMetricsData?.data ?? {};

  const isLoading = reqLoading || usersLoading;

  const total = metrics.total ?? "...";
  const pending = metrics.byStatus?.pending ?? 0;
  const processing = metrics.byStatus?.processing ?? 0;
  const completed = metrics.byStatus?.completed ?? 0;
  const rejected = metrics.byStatus?.rejected ?? 0;
  const claimed = metrics.claimed ?? 0;
  const open = metrics.open ?? 0;

  const perDay = metrics.perDay ?? [];
  const recent = metrics.recentRequests ?? [];

  return (
    <div className="py-6 md:py-8 px-4 md:px-6 space-y-6 md:space-y-7">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-2xl md:text-3xl font-bold mb-1"
          style={{ color: "var(--text)" }}
        >
          Admin Dashboard
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Overview and operational metrics
        </p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-7">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <StatCard
            title="Total Requests"
            value={isLoading ? "..." : total}
            icon={<FileText size={20} />}
          />
          <StatCard
            title="Open Requests"
            value={isLoading ? "..." : open}
            icon={<Zap size={20} />}
          />
          <StatCard
            title="Processing"
            value={isLoading ? "..." : processing}
            icon={<Clock size={20} />}
          />
          <StatCard
            title="Completed"
            value={isLoading ? "..." : completed}
            icon={<CheckCircle2 size={20} />}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <StatCard
            title="Claimed Requests"
            value={isLoading ? "..." : claimed}
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            title="Rejected Requests"
            value={isLoading ? "..." : rejected}
            icon={<AlertCircle size={20} />}
          />
          <StatCard
            title="Total Users"
            value={isLoading ? "..." : (usersMetrics.total ?? 0)}
            icon={<Users size={20} />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Activity Chart */}
          <Card className="lg:col-span-2">
            <div className="mb-3">
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--text)" }}
              >
                Request Activity (14 Days)
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Daily request volume
              </p>
            </div>
            {isLoading ? (
              <div
                className="h-32 flex items-center justify-center"
                style={{ color: "var(--muted)" }}
              >
                Loading...
              </div>
            ) : (
              <BarChart data={perDay} />
            )}
          </Card>

          {/* Status Distribution */}
          <Card>
            <div className="mb-3">
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--text)" }}
              >
                Status Distribution
              </h2>
            </div>
            {isLoading ? (
              <div
                className="flex items-center justify-center h-32"
                style={{ color: "var(--muted)" }}
              >
                Loading...
              </div>
            ) : (
              <StatusDistribution
                pending={pending}
                processing={processing}
                completed={completed}
                rejected={rejected}
              />
            )}
          </Card>
        </div>

        {/* Recent Requests */}
        <Card>
          <div className="mb-3">
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--text)" }}
            >
              Recent Requests
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Latest {Math.min(5, recent.length)} requests
            </p>
          </div>

          {isLoading ? (
            <div className="py-8 text-center" style={{ color: "var(--muted)" }}>
              Loading requests...
            </div>
          ) : recent.length === 0 ? (
            <div className="py-8 text-center" style={{ color: "var(--muted)" }}>
              No requests found
            </div>
          ) : (
            <div className="space-y-2">
              {recent.slice(0, 5).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border flex items-center justify-between hover:bg-opacity-50 transition-colors"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {item.routeFrom} → {item.routeTo}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--muted)" }}
                    >
                      {new Date(
                        item.createdAt || item.date,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {(() => {
                      const badge = getStatusBadge(item.status, item.user);
                      return (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-md ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
