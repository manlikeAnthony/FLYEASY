import React from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    // Validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Name, email, and password are required");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      setSuccessMessage("Check your email to verify your account");
      // Clear form
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Registration failed";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // If registration was successful, show success state
  if (successMessage) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <Card className="w-full max-w-md">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full"
                style={{ backgroundColor: "rgba(16,185,129,0.12)" }}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "var(--success)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              Registration Successful
            </h1>

            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                border: "1px solid var(--success)",
                backgroundColor: "rgba(16,185,129,0.08)",
                color: "var(--success)",
              }}
            >
              {successMessage}
            </div>

            <p className="text-sm" style={{ color: "var(--muted)" }}>
              We've sent a verification email to <strong>{email}</strong>. Click
              the link in the email to verify your account.
            </p>

            <div className="space-y-2 pt-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              Create Account
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Join us to manage your flight requests
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div
                className="rounded-lg px-3 py-2 text-sm"
                style={{
                  border: "1px solid var(--error)",
                  backgroundColor: "rgba(239,68,68,0.06)",
                  color: "var(--error)",
                }}
              >
                {errorMessage}
              </div>
            )}

            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="John Doe"
            />

            <Input
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
            />
            <p
              className="text-xs"
              style={{ color: "var(--muted)", marginTop: 4 }}
            >
              At least 6 characters
            </p>

            <Button
              variant="primary"
              type="submit"
              className="w-full mt-2"
              loading={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>

          <div
            className="pt-4 text-sm text-center"
            style={{
              borderTop: "1px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--accent-2)", fontWeight: 600 }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
