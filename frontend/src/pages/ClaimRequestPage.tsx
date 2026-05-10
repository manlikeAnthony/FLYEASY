import React from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { useMutation } from "@tanstack/react-query";
import { claimRequest } from "../services/requests";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ClaimRequestPage() {
  const [trackingId, setTrackingId] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: (id: string) => claimRequest(id),
    onSuccess: () => {
      setErrorMessage("");
      setMessage("Request successfully claimed");
      setTimeout(() => navigate("/my"), 700);
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Error";
      setMessage("");
      if (status === 404 || msg?.toLowerCase().includes("not found")) {
        setErrorMessage("Invalid tracking ID");
      } else if (
        (status === 400 || status === 409) &&
        msg?.toLowerCase().includes("already")
      ) {
        setErrorMessage("Request already claimed");
      } else {
        setErrorMessage(msg);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");
    if (!user) {
      setErrorMessage("You are not logged in");
      return;
    }
    if (!trackingId.trim()) {
      setErrorMessage("Please enter a tracking ID");
      return;
    }
    mutation.mutate(trackingId);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <h1 className="text-2xl font-bold text-[#1E4E8C] mb-2">Claim Request</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter your tracking ID to claim a request assigned to you.
        </p>

        {message && (
          <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tracking ID
            </label>
            <input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
              placeholder="Enter tracking ID"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Claiming..." : "Claim Request"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
