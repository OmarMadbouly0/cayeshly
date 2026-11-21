import { auth } from "@/lib/auth";
import { ForbiddenError } from "@/shared/errors/application-error";

export async function requireTrustedOrigin(request: Request): Promise<void> {
  const origin = request.headers.get("origin");
  const context = await auth.$context;
  if (!origin || !context.isTrustedOrigin(origin)) {
    throw new ForbiddenError("Untrusted request origin.");
  }
}
