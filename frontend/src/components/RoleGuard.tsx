import React from "react";
import Card from "./Card";
import { useAuth } from "../contexts/AuthContext";

type RoleGuardProps = {
  allowedRoles: string[];
  children: React.ReactNode;
};

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Card>
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-sm text-gray-600">
            You do not have permission to access this page.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
