import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Input from "./Input";
import Button from "./Button";
import Card from "./Card";
import type { FlightRequestForm } from "../types/requests";
import { createFlightRequest } from "../services/requests";
import type { AxiosError } from "axios";

type CreateRequestResponse = {
  id: string;
  trackingId: string;
  status: string;
};

type ApiErrorPayload = {
  message?: string;
  code?: string;
};

export default function RequestForm() {
  const [formData, setFormData] = useState<FlightRequestForm>({
    name: "",
    from: "",
    to: "",
    date: "",
    budget: "",
    contact: "",
  });
  const [createdRequest, setCreatedRequest] =
    useState<CreateRequestResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const requestMutation = useMutation({
    mutationFn: async (data: FlightRequestForm) => {
      const response = await createFlightRequest({
        ...data,
        budget: data.budget ? Number(data.budget) : undefined,
      });
      return response as CreateRequestResponse;
    },
    onSuccess: (response) => {
      setCreatedRequest(response);
      setErrorMessage(null);
      setCopyMessage(null);
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<ApiErrorPayload>;
      setErrorMessage(
        axiosError.response?.data?.message ?? "Failed to submit request",
      );
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCopyMessage(null);
    requestMutation.mutate(formData);
  };

  const handleCopyTrackingId = async () => {
    if (!createdRequest?.trackingId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdRequest.trackingId);
      setCopyMessage("Tracking ID copied to clipboard");
    } catch {
      setCopyMessage("Unable to copy tracking ID. Please copy it manually.");
    }
  };

  const formatStatus = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  if (createdRequest) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-green-600">
              Request Created
            </p>
            <h3 className="text-3xl font-bold text-gray-900">
              Your flight request has been submitted
            </h3>
            <p className="text-gray-600">
              Save your tracking ID to check the progress of your request.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Tracking ID
              </p>
              <p className="text-4xl md:text-5xl font-black tracking-[0.2em] text-[#1E4E8C] break-all">
                {createdRequest.trackingId}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Status
              </p>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
                {formatStatus(createdRequest.status)}
              </span>
            </div>
          </div>

          {copyMessage && (
            <div
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              role="alert"
            >
              {copyMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              variant="primary"
              className="w-full sm:w-auto"
              onClick={handleCopyTrackingId}
            >
              Copy Tracking ID
            </Button>

            <Link
              to="/my"
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded-lg font-semibold border border-gray-200 bg-white text-gray-800 hover:shadow-sm transition-colors duration-200"
            >
              Go to My Requests
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />
          <Input
            label="Departure Location"
            name="from"
            value={formData.from}
            onChange={handleChange}
            required
          />
          <Input
            label="Destination"
            name="to"
            value={formData.to}
            onChange={handleChange}
            required
          />
          <Input
            label="Travel Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <Input
            label="Budget (₦)"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={requestMutation.isPending}
          >
            {requestMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </div>

        {requestMutation.isError && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {errorMessage ?? "Failed to submit request. Please try again."}
          </div>
        )}
      </form>
    </Card>
  );
}
