import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/shared/errors/application-error";

export async function getCurrentUser(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw new UnauthorizedError("Authentication required.");
  }

  return session.user;
}
