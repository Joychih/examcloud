import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../utils/auth";

type RequireRoleProps = {
  role: UserRole | UserRole[];
  children: React.ReactNode;
};

export default function RequireRole({ role, children }: RequireRoleProps) {
  const { role: currentRole } = useAuth();
  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }
  
  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
