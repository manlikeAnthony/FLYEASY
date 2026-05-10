import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { getRequestByTrackingId } from "../services/tracking";
import type { FlightRequest } from "../types/requests";
import { getStatusBadge } from "../utils/requestStatus";

export default function TrackRequestPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [trackingId, setTrackingId] = useState(id ?? "");

  const trackQuery = useQuery({
    queryKey: ["track-request", id],
    queryFn: () => getRequestByTrackingId(id as string),
    enabled: !!id,
    retry: false,
  });

  const response = trackQuery.data;
  const request = response?.data as FlightRequest | undefined;
  const isInvalidTrackingId =
    typeof trackQuery.error === "object" &&
    trackQuery.error !== null &&
    "response" in trackQuery.error &&
    Boolean((trackQuery.error as any).response?.status === 404);

  const badge = request
    ? getStatusBadge(request.status, request.user)
    : { label: "Unknown", classes: "bg-gray-100 text-gray-800" };
  const statusClass = badge.classes;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = trackingId.trim();

    if (!normalized) {
      return;
    }

    setTrackingId(normalized);
    navigate(`/track-request/${normalized}`);
  };

  const renderHeader = () => (
    <div className="text-center space-y-3">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
        Track Your Request
      </h1>
      <p className="text-gray-600">
        Enter your tracking ID to check the current status of your flight
        request.
      </p>
    </div>
  );

  const renderSearchForm = () => (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tracking ID"
          placeholder="Enter your tracking ID"
          value={trackingId}
          onChange={(event) => setTrackingId(event.target.value)}
          autoComplete="off"
          required
        />

        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            <span className="inline-flex items-center gap-2">
              <Search className="h-4 w-4" />
              Track Request
            </span>
          </Button>
        </div>
      </form>
    </Card>
  );

  if (!id) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {renderHeader()}
        {renderSearchForm()}
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No tracking ID provided yet.
        </div>
      </div>
    );
  }

  if (trackQuery.isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {renderHeader()}
        {renderSearchForm()}
        <Card>
          <div className="flex items-center justify-center py-10 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading tracking result...
          </div>
        </Card>
      </div>
    );
  }

  if (trackQuery.isError) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {renderHeader()}
        {renderSearchForm()}
        {isInvalidTrackingId ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Invalid tracking ID
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Network failure. Please check your connection and try again.
          </div>
        )}
      </div>
    );
  }

  if (!response || !response.data || !request) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {renderHeader()}
        {renderSearchForm()}
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No tracking data found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {renderHeader()}
      {renderSearchForm()}

      <Card>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <h2 className="text-xl font-semibold text-gray-900">
                {request.name}
              </h2>
            </div>

            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
            >
              {badge.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-gray-500 mb-1">Route</p>
              <p className="font-medium text-gray-900">
                {request.from} → {request.to}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-gray-500 mb-1">Date</p>
              <p className="font-medium text-gray-900">
                {new Date(request.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
              Tracking ID
            </p>
            <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800 break-all">
              {request.trackingId}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
