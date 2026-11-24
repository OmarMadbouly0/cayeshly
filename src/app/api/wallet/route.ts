import { getCurrentUser } from "@/lib/current-user";
import { requireRole } from "@/lib/require-role";
import { apiOk } from "@/app/api/_shared/responses";
import { walletService } from "@/services/wallet.service";
import { handleRouteError } from "../_shared/route-errors";
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    requireRole(user, "user");
    const wallet = await walletService.getWalletByUserId(user.id);
    return apiOk(wallet, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
