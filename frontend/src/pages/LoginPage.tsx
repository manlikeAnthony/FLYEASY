import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import api from "../services/api";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

type ApiErrorPayload = {
  message?: string;
  code?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const getApiError = (error: unknown) => {
    const axiosError = error as AxiosError<ApiErrorPayload>;
    return {
      message: axiosError.response?.data?.message ?? null,
      code: axiosError.response?.data?.code ?? null,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setErrorCode("");
    setResendMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const payload = res.data?.data || res.data || res;
      const user = payload.user || payload;
      setUser(user);
      navigate(user?.role === "ADMIN" ? "/admin" : "/my");
    } catch (error: unknown) {
      const { message, code } = getApiError(error);
      setErrorMessage(message ?? "Unable to log in");
      setErrorCode(code);
    } finally {
      setLoading(false);
    }
  };

  const isEmailNotVerified = errorCode === "EMAIL_NOT_VERIFIED";

  const handleResendVerificationEmail = async () => {
    if (!email.trim()) {
      setErrorMessage("Email is required to resend verification email");
      return;
    }

    setResendLoading(true);
    setResendMessage(null);
    try {
      await api.post("/auth/resend-verification-email", {
        email: email.trim(),
      });
      setResendMessage("Verification email sent");
    } catch (error: unknown) {
      const { message, code } = getApiError(error);
      setErrorMessage(message ?? "Unable to resend verification email");
      setErrorCode(code);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              Welcome Back
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--muted)", marginTop: 4 }}
            >
              Sign in to access your flight requests and bookings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                role="alert"
                style={{
                  border: "1px solid var(--error)",
                  backgroundColor: "rgba(239, 68, 68, 0.06)",
                  color: "var(--error)",
                }}
              >
                {errorMessage}
              </div>
            )}
            {resendMessage && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{
                  border: "1px solid var(--success)",
                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                  color: "var(--success)",
                }}
              >
                {resendMessage}
              </div>
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {isEmailNotVerified && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={resendLoading}
                onClick={handleResendVerificationEmail}
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </Button>
            )}
          </form>

          <div
            className="border-t"
            style={{ borderColor: "var(--border)", paddingTop: 16 }}
          >
            <div
              style={{
                color: "var(--muted)",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{ color: "var(--accent-2)", fontWeight: 600 }}
              >
                Create one
              </Link>
            </div>
            <div style={{ textAlign: "center" }}>
              <Link
                to="/forgot-password"
                style={{ color: "var(--accent)", textDecoration: "underline" }}
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
