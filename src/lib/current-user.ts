import { auth } from "@/lib/auth";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/shared/errors/application-error";

export type AuthenticatedUser = typeof auth.$Infer.Session.user;
export type UserRole = NonNullable<AuthenticatedUser["role"]>;

//logined
export async function getCurrentUser(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw new UnauthorizedError("Authentication required.");
  }

  return session.user;
}

//logined and onbaorded
export async function requireOnboardedUser(request: Request) {
  const user = await getCurrentUser(request);

  if (user.onboarded !== true) {
    throw new ForbiddenError("Complete onboarding before using this feature.");
  }

  return user;
}
