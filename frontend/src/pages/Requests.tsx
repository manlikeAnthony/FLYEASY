import { useEffect, useState } from "react";
import { getFlightRequests } from "../services/requests";
import type { FlightRequest } from "../types/requests";
import Card from "../components/Card";
import { useAuth } from "../contexts/AuthContext";
import { getStatusBadge } from "../utils/requestStatus";

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FlightRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const data = await getFlightRequests();
        setRequests(data.data || []);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load requests";
        setError(message);
      }
    };

    fetchData();
  }, [user]);

  const loading = !!user && requests.length === 0 && !error;

  if (!user) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg font-semibold text-gray-800">
          You are not logged in
        </p>
        <p className="text-gray-600 mt-2">
          Please login to view flight requests.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="py-8 text-center">Loading flight requests...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="py-4">
      <h1 className="text-2xl font-semibold text-[#1E4E8C]">Flight Requests</h1>

      {requests.length === 0 && (
        <p className="text-gray-600 mt-4">No flight requests yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {requests.map((r, i) => (
          <Card key={r._id || i}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium text-gray-900">{r.name}</div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Budget</div>
                <div className="font-medium">₦{r.budget ?? "—"}</div>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-700">
              <div>
                <span className="font-medium text-gray-900">Route:</span>{" "}
                {r.from} → {r.to}
              </div>
              <div className="mt-1">
                <span className="font-medium text-gray-900">Date:</span>{" "}
                {new Date(r.date).toLocaleDateString()}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-medium text-gray-900">Status:</span>
                {(() => {
                  const b = getStatusBadge(r.status, r.user);
                  return (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${b.classes}`}
                    >
                      {b.label}
                    </span>
                  );
                })()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
