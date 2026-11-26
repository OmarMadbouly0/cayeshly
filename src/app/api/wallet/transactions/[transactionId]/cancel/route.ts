import { requireTrustedOrigin } from "@/app/api/_shared/request-origin";
import { apiOk } from "@/app/api/_shared/responses";
import { handleRouteError } from "@/app/api/_shared/route-errors";
import { requireOnboardedUser } from "@/lib/current-user";
import { requireRole } from "@/lib/require-role";
import { walletService } from "@/services/wallet.service";
import { parseId } from "@/shared/validation/parse-id";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ transactionId: string }> },
) {
  try {
    await requireTrustedOrigin(request);
    const user = await requireOnboardedUser(request);
    requireRole(user, "user");
    const transactionId = parseId((await context.params).transactionId);
    return apiOk(await walletService.cancelTransaction(user.id, transactionId));
  } catch (error) {
    return handleRouteError(error);
  }
}
