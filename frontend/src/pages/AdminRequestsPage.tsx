import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteRequest,
  getFlightRequests,
  updateRequest,
} from "../services/requests";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/Card";
import { getStatusBadge, getNextStatus } from "../utils/requestStatus";

type AdminRequestItem = {
  _id?: string;
  trackingId?: string;
  name?: string;
  from?: string;
  to?: string;
  status?: string;
  user?: { email?: string; name?: string };
  createdAt?: string;
};

// Status helper is centralized in ../utils/requestStatus

export default function AdminRequestsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: getFlightRequests,
    enabled: !!user && user.role === "ADMIN",
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateRequest(id, { status }),
    onSuccess: () => {
      setErrorMessage("");
      setSuccessMessage("Request updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
    onError: (error: any) => {
      setSuccessMessage("");
      setErrorMessage(
        error?.response?.data?.message || "Failed to update request.",
      );
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteRequest(id),
    onSuccess: () => {
      setErrorMessage("");
      setSuccessMessage("Request deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
    onError: (error: any) => {
      setSuccessMessage("");
      setErrorMessage(
        error?.response?.data?.message || "Failed to delete request.",
      );
    },
  });

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="py-8">
        <Card className="max-w-lg mx-auto">
          <h2 className="font-semibold">Access Denied</h2>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
            You must be an admin to view this page.
          </p>
        </Card>
      </div>
    );
  }

  const items = ((data?.data as AdminRequestItem[]) || []).filter(Boolean);

  const filtered = items.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (!search.trim()) return true;

    const q = search.toLowerCase().trim();
    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.trackingId || "").toLowerCase().includes(q) ||
      (item.user?.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-6 space-y-5">
      {/* Header */}
      <div>
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ color: "var(--accent)" }}
        >
          Admin Requests
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage and track all flight booking requests.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-3">
          {/* Search Row */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Search
            </label>
            <input
              type="text"
              placeholder="Name, tracking ID, or email"
              className="w-full px-3 py-2 rounded-lg text-sm border"
              style={{
                backgroundColor: "var(--input-bg)",
                color: "var(--input-text)",
                borderColor: "var(--border)",
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status & Actions Row */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--muted)" }}
              >
                Status
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{
                  backgroundColor: "var(--input-bg)",
                  color: "var(--input-text)",
                  borderColor: "var(--border)",
                }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--muted)" }}
              >
                Count
              </label>
              <div
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                {filtered.length}
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label
                className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--muted)" }}
              >
                Actions
              </label>
              <button
                type="button"
                className="w-full px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  backgroundColor: "var(--card-bg)",
                }}
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setSuccessMessage("");
                  setErrorMessage("");
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Messages */}
      {successMessage && (
        <div
          className="px-4 py-3 rounded-lg text-sm border"
          style={{
            borderColor:
              "color-mix(in srgb, var(--success) 40%, var(--border))",
            color: "var(--success)",
            backgroundColor:
              "color-mix(in srgb, var(--success) 10%, transparent)",
          }}
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          className="px-4 py-3 rounded-lg text-sm border"
          style={{
            borderColor: "color-mix(in srgb, var(--error) 40%, var(--border))",
            color: "var(--error)",
            backgroundColor:
              "color-mix(in srgb, var(--error) 10%, transparent)",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Content */}
      <Card>
        {isLoading ? (
          <div className="space-y-3">
            <div
              className="h-4 rounded bg-opacity-20 animate-pulse"
              style={{ backgroundColor: "var(--border)" }}
            />
            <div
              className="h-4 rounded w-5/6 bg-opacity-20 animate-pulse"
              style={{ backgroundColor: "var(--border)" }}
            />
            <div
              className="h-4 rounded w-2/3 bg-opacity-20 animate-pulse"
              style={{ backgroundColor: "var(--border)" }}
            />
          </div>
        ) : isError ? (
          <p style={{ color: "var(--error)" }}>Failed to load requests.</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No requests found.</p>
        ) : (
          <>
            {/* Mobile Cards - Hidden on MD and up */}
            <div className="space-y-3 md:hidden">
              {filtered.map((request) => {
                const requestId = request._id;
                const currentStatus = request.status;
                const badge = getStatusBadge(currentStatus, request.user);

                return (
                  <article
                    key={requestId || request.trackingId}
                    className="rounded-lg border p-3"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor:
                        "color-mix(in srgb, var(--bg) 50%, transparent)",
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {request.name || "Unnamed"}
                        </h3>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "var(--muted)" }}
                        >
                          {request.user?.email || "Unknown user"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Details */}
                    <div
                      className="text-xs space-y-1 mb-3"
                      style={{ color: "var(--muted)" }}
                    >
                      <div>
                        <span className="font-medium">Route:</span>{" "}
                        {request.from || "?"} → {request.to || "?"}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span>{" "}
                        {request.trackingId || "—"}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="px-2 py-1.5 rounded text-xs font-medium text-white disabled:opacity-50"
                        style={{ backgroundColor: "var(--accent)" }}
                        disabled={updateMut.isPending || !requestId}
                        onClick={() => {
                          if (!requestId) return;
                          setSuccessMessage("");
                          setErrorMessage("");
                          updateMut.mutate({
                            id: requestId,
                            status: getNextStatus(currentStatus),
                          });
                        }}
                      >
                        {updateMut.isPending ? "..." : "Advance"}
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1.5 rounded text-xs font-medium text-white disabled:opacity-50"
                        style={{ backgroundColor: "var(--error)" }}
                        disabled={deleteMut.isPending || !requestId}
                        onClick={() => {
                          if (!requestId) return;
                          if (!window.confirm("Delete this request?")) return;
                          setSuccessMessage("");
                          setErrorMessage("");
                          deleteMut.mutate(requestId);
                        }}
                      >
                        {deleteMut.isPending ? "..." : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: "var(--muted)" }}
                    >
                      Name
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: "var(--muted)" }}
                    >
                      Route
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: "var(--muted)" }}
                    >
                      Status
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: "var(--muted)" }}
                    >
                      Tracking ID
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: "var(--muted)" }}
                    >
                      User
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: "var(--muted)" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((request) => {
                    const requestId = request._id;
                    const currentStatus = request.status;

                    return (
                      <tr
                        key={requestId || request.trackingId}
                        style={{ borderTop: "1px solid var(--border)" }}
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          {request.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {request.from} → {request.to}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {(() => {
                            const badge = getStatusBadge(
                              currentStatus,
                              request.user,
                            );
                            return (
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badge.classes}`}
                              >
                                {badge.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">
                          {request.trackingId || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {request.user?.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="px-3 py-1 rounded text-xs font-medium text-white disabled:opacity-50"
                              style={{ backgroundColor: "var(--accent)" }}
                              disabled={updateMut.isPending || !requestId}
                              onClick={() => {
                                if (!requestId) return;
                                setSuccessMessage("");
                                setErrorMessage("");
                                updateMut.mutate({
                                  id: requestId,
                                  status: getNextStatus(currentStatus),
                                });
                              }}
                            >
                              {updateMut.isPending ? "..." : "Advance"}
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 rounded text-xs font-medium text-white disabled:opacity-50"
                              style={{ backgroundColor: "var(--error)" }}
                              disabled={deleteMut.isPending || !requestId}
                              onClick={() => {
                                if (!requestId) return;
                                if (!window.confirm("Delete this request?"))
                                  return;
                                setSuccessMessage("");
                                setErrorMessage("");
                                deleteMut.mutate(requestId);
                              }}
                            >
                              {deleteMut.isPending ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
