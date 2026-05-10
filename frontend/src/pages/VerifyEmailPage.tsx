import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import api from "../services/api";
import { useEffect, useState } from "react";

const Spinner = () => (
  <div className="flex items-center justify-center py-8">
    <div
      className="h-8 w-8 animate-spin rounded-full"
      style={{
        border: "4px solid var(--accent)",
        borderTopColor: "transparent",
      }}
    />
  </div>
);

const verifyEmail = async (token: string, email: string) => {
  const res = await api.post("/auth/verify-email", { token, email });
  return res.data;
};

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const email = searchParams.get("email")?.trim() || "";

  // Resend controls
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    let timer: number | undefined;
    if (cooldown > 0) {
      timer = window.setInterval(() => {
        setCooldown((c) => Math.max(0, c - 1));
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [cooldown]);

  const query = useQuery({
    queryKey: ["verify-email", email, token],
    queryFn: () => verifyEmail(token, email),
    enabled: Boolean(token && email),
    retry: false,
  });

  const invalidParams = !token || !email;
  const errorCode = (query.error as any)?.response?.data?.code;
  const errorMessage = (query.error as any)?.response?.data?.message;
  const isExpired =
    errorCode === "AUTH_TOKEN_EXPIRED" || /expired/i.test(errorMessage || "");
  const statusMessage = invalidParams
    ? "Invalid verification link"
    : query.isLoading
      ? "Verifying your email..."
      : query.isSuccess
        ? "Email verified successfully"
        : isExpired
          ? "Verification link expired"
          : (errorMessage ?? "Invalid verification link");

  const handleResend = async () => {
    if (!email) {
      setResendError("Missing email to resend verification link.");
      return;
    }
    if (cooldown > 0) return;

    setResendLoading(true);
    setResendMessage(null);
    setResendError(null);

    try {
      const response = await api.post("/auth/resend-verification-email", {
        email,
      });
      setResendMessage(
        response.data?.message ||
          "Verification email sent. Please check your inbox.",
      );
      setCooldown(45);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to resend verification email";
      setResendError(errorMsg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <Card className="w-full max-w-md">
        <div className="space-y-6 text-center">
          <h1 className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
            Verify Email
          </h1>

          {query.isLoading && <Spinner />}

          <p
            style={{
              color: query.isSuccess ? "var(--success)" : "var(--error)",
            }}
          >
            {statusMessage}
          </p>

          {query.isSuccess ? (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Your email has been verified. You can now sign in.
              </p>
              <Link to="/login">
                <Button variant="primary">Go to Login</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                If your verification link expired, you can request a new one.
              </p>

              {resendMessage && (
                <div
                  role="alert"
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{
                    border: "1px solid var(--success)",
                    backgroundColor: "rgba(16,185,129,0.08)",
                    color: "var(--success)",
                  }}
                >
                  {resendMessage}
                </div>
              )}

              {resendError && (
                <div
                  role="alert"
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{
                    border: "1px solid var(--error)",
                    backgroundColor: "rgba(239,68,68,0.06)",
                    color: "var(--error)",
                  }}
                >
                  {resendError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full sm:w-auto"
                  onClick={handleResend}
                  disabled={resendLoading || cooldown > 0}
                >
                  {resendLoading
                    ? "Sending..."
                    : cooldown > 0
                      ? `Resend (${cooldown}s)`
                      : "Resend verification email"}
                </Button>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card-bg)",
                    color: "var(--text)",
                  }}
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
