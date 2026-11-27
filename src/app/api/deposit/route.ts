import { readJsonBody } from "@/app/api/_shared/request-body";
import { requireTrustedOrigin } from "@/app/api/_shared/request-origin";
import { apiOk } from "@/app/api/_shared/responses";
import { handleRouteError } from "@/app/api/_shared/route-errors";
import { walletTransactionSchema } from "@/services/wallet.schemas";
import { walletService } from "@/services/wallet.service";
import { parseInput } from "@/shared/validation/parse-input";
import { requireOnboardedUser } from "@/lib/current-user";
import { requireRole } from "@/lib/require-role";
export async function POST(request: Request) {
  try {
    await requireTrustedOrigin(request);
    const currentUser = await requireOnboardedUser(request);
    requireRole(currentUser, "user");
    const body = await readJsonBody(request);
    const input = parseInput(walletTransactionSchema, body);
    const transaction = await walletService.walletDeposit(
      currentUser.id,
      input,
    );

    return apiOk(transaction, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
