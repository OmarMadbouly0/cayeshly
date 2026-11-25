import { readJsonBody } from "@/app/api/_shared/request-body";
import { requireTrustedOrigin } from "@/app/api/_shared/request-origin";
import { apiOk } from "@/app/api/_shared/responses";
import { handleRouteError } from "@/app/api/_shared/route-errors";
import { getCurrentUser } from "@/lib/current-user";
import { requireRole } from "@/lib/require-role";
import { reviewTransactionSchema } from "@/services/admin.schemas";
import { adminService } from "@/services/admin.service";
import { parseId } from "@/shared/validation/parse-id";
import { parseInput } from "@/shared/validation/parse-input";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ transactionId: string }> },
) {
  try {
    await requireTrustedOrigin(request);
    const user = await getCurrentUser(request);
    requireRole(user, "admin");
    const transactionId = parseId((await context.params).transactionId);
    const body = await readJsonBody(request);
    const input = parseInput(reviewTransactionSchema, body);

    const deposit = await adminService.reviewTransaction(transactionId, input);

    return apiOk(deposit);
  } catch (error) {
    return handleRouteError(error);
  }
}
