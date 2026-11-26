import { apiOk } from "@/app/api/_shared/responses";
import { handleRouteError } from "@/app/api/_shared/route-errors";
import { getCurrentUser } from "@/lib/current-user";
import { requireRole } from "@/lib/require-role";
import { transactionListQuerySchema } from "@/services/admin.schemas";
import { adminService } from "@/services/admin.service";
import { parseInput } from "@/shared/validation/parse-input";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    requireRole(user, "admin");

    const query = parseInput(
      transactionListQuerySchema,
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const transactions = await adminService.getTransactions(query);

    return apiOk(transactions);
  } catch (error) {
    return handleRouteError(error);
  }
}
