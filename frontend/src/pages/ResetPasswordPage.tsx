import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import api from "../services/api";

const resetPassword = async (
  email: string,
  token: string,
  password: string,
) => {
  const res = await api.post("/auth/reset-password", {
    email,
    token,
    password,
  });
  return res.data;
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const email = searchParams.get("email")?.trim() || "";

  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const mutation = useMutation({
    mutationFn: (nextPassword: string) =>
      resetPassword(email, token, nextPassword),
    onSuccess: () => {
      setErrorMessage("");
      setSuccessMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 800);
    },
    onError: (error: any) => {
      setSuccessMessage("");
      setErrorMessage(
        error?.response?.data?.message || "Unable to reset password",
      );
    },
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token || !email) {
      setErrorMessage("Invalid or expired reset link");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("New password is required");
      return;
    }

    mutation.mutate(password);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <h1 className="text-2xl font-bold text-[#1E4E8C] mb-2">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter your new password to complete the reset.
        </p>

        {(!token || !email) && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Invalid or expired reset link
          </div>
        )}

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
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
              placeholder="Enter a new password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={mutation.isPending || !token || !email}
          >
            {mutation.isPending ? "Resetting..." : "Reset Password"}
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
