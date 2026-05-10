import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white border rounded-md p-6 text-center">
          <h2 className="text-lg font-semibold">You are not logged in</h2>
          <p className="text-sm text-gray-600 mt-2">
            You need to sign in to access this page.
          </p>
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-primary text-white rounded-md"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
