import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import { getMyRequests } from "../services/requests";
import type { FlightRequest } from "../types/requests";
import { useAuth } from "../contexts/AuthContext";
import { getStatusBadge } from "../utils/requestStatus";

export default function MyRequestsPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-requests"],
    queryFn: getMyRequests,
    enabled: !!user,
    retry: false,
  });

  // Not logged in state
  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-[#1E4E8C]">My Requests</h1>
          <Link to="/claim">
            <Button variant="outline">Claim Request</Button>
          </Link>
        </div>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You are not logged in</p>
            <p className="text-gray-600 mb-4">
              Please log in to view your flight requests.
            </p>
            <Link to="/login">
              <Button variant="primary">Go to Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-[#1E4E8C]">My Requests</h1>
          <Link to="/claim">
            <Button variant="outline">Claim Request</Button>
          </Link>
        </div>
        <Card>
          <p className="text-red-600">
            Failed to load your requests. Please try again.
          </p>
        </Card>
      </div>
    );
  }

  // Loading state with skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-[#1E4E8C]">My Requests</h1>
          <Link to="/claim">
            <Button variant="outline">Claim Request</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} skeleton />
          ))}
        </div>
      </div>
    );
  }

  const requests = (data?.data || []) as FlightRequest[];

  // Empty state
  if (requests.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-[#1E4E8C]">My Requests</h1>
          <Link to="/claim">
            <Button variant="outline">Claim Request</Button>
          </Link>
        </div>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You have no requests yet.</p>
            <Link to="/book">
              <Button variant="primary">Create a Request</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Requests list
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#1E4E8C]">My Requests</h1>
        <Link to="/claim">
          <Button variant="outline">Claim Request</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((req) => (
          <Card key={req._id || req.trackingId}>
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Name
                  </p>
                  <p className="font-semibold text-gray-900">{req.name}</p>
                </div>
                {(() => {
                  const b = getStatusBadge(req.status, req.user);
                  return (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${b.classes}`}
                    >
                      {b.label}
                    </span>
                  );
                })()}
              </div>

              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {req.from} → {req.to}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">
                    {new Date(req.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Budget</p>
                  <p className="font-medium text-gray-800">
                    ₦{req.budget ?? "—"}
                  </p>
                </div>
              </div>

              {req.trackingId && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Tracking ID</p>
                  <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1">
                    <code className="text-xs text-gray-700 break-all">
                      {req.trackingId}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
