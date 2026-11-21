import { getCurrentUser } from "@/lib/current-user";
import { apiOk } from "@/app/api/_shared/responses";
import { handleRouteError } from "@/app/api/_shared/route-errors";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);

    return apiOk({
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        onboarded: user.onboarded,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
