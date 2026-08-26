import type { ReactNode } from "react";
import type { Role } from "../../../shared/api/types.ts";
import { useAuth } from "../hooks/useAuth.ts";

interface RequirePermissionProps {
  permissions?: string[];
  roles?: Role[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders part of a page. Use it to hide buttons and links the
 * current user is not allowed to use:
 *
 *   <RequirePermission permissions={[PERMISSIONS.USER_CREATE]}>
 *     <button>Add staff member</button>
 *   </RequirePermission>
 */
const RequirePermission = ({
  permissions = [],
  roles = [],
  fallback = null,
  children,
}: RequirePermissionProps) => {
  const { hasPermission, hasRole } = useAuth();

  const permissionOk = permissions.length === 0 || hasPermission(...permissions);
  const roleOk = roles.length === 0 || hasRole(...roles);

  return permissionOk && roleOk ? children : fallback;
};

export default RequirePermission;
