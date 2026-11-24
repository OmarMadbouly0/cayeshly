import { AuthenticatedUser, UserRole } from "@/lib/current-user";
import { ForbiddenError } from "@/shared/errors/application-error";
export function requireRole(user: AuthenticatedUser, role: UserRole): void {
  if (user.role !== role) {
    throw new ForbiddenError(
      `You must have role ${role} to access this feature.`,
    );
  }
}
