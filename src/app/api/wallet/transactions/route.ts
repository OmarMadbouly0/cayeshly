import { handleRouteError } from "@/app/api/_shared/route-errors";
import { apiOk } from "@/app/api/_shared/responses";
import { getCurrentUser } from "@/lib/current-user";
import { requireRole } from "@/lib/require-role";
import { walletService } from "@/services/wallet.service";
import { paginationQuerySchema } from "@/shared/validation/pagination.schema";
import { parseInput } from "@/shared/validation/parse-input";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    requireRole(user, "user");

    const pagination = parseInput(
      paginationQuerySchema,
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const transactions = await walletService.getTransactionsByUserId(
      user.id,
      pagination,
    );

    return apiOk(transactions, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
