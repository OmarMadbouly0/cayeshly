import { readJsonBody } from "@/app/api/_shared/request-body";
import { requireTrustedOrigin } from "@/app/api/_shared/request-origin";
import { apiOk } from "@/app/api/_shared/responses";
import { handleRouteError } from "@/app/api/_shared/route-errors";
import { requireOnboardedUser } from "@/lib/current-user";
import { requireRole } from "@/lib/require-role";
import { walletTransactionSchema } from "@/services/wallet.schemas";
import { walletService } from "@/services/wallet.service";
import { parseInput } from "@/shared/validation/parse-input";

export async function POST(request: Request) {
  try {
    await requireTrustedOrigin(request);
    const user = await requireOnboardedUser(request);
    requireRole(user, "user");

    const input = parseInput(
      walletTransactionSchema,
      await readJsonBody(request),
    );
    const transaction = await walletService.requestWithdrawal(user.id, input);
    return apiOk(transaction, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
