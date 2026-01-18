import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../utils/auth";

type RequireRoleProps = {
  role: UserRole;
  children: React.ReactNode;
};

export default function RequireRole({ role, children }: RequireRoleProps) {
  const { role: currentRole } = useAuth();
  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }
  if (currentRole !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
