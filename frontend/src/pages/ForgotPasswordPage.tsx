import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import api from "../services/api";

const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setErrorMessage("");
      setSuccessMessage("Password reset email sent successfully");
    },
    onError: (error: any) => {
      setSuccessMessage("");
      setErrorMessage(
        error?.response?.data?.message || "Failed to send reset link",
      );
    },
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Email is required");
      return;
    }

    mutation.mutate(email.trim());
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <h1 className="text-2xl font-bold text-[#1E4E8C] mb-2">
          Forgot Password
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter your email address and we will send a reset link.
        </p>

        {successMessage && (
          <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
              placeholder="you@example.com"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <Link to="/login" className="text-[#1E4E8C] hover:underline">
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
