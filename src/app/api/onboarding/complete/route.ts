import { getCurrentUser } from "@/lib/current-user";
import { completeOnboardingSchema } from "@/services/onboarding.schemas";
import { onboardingService } from "@/services/onboarding.service";
import { parseInput } from "@/shared/validation/parse-input";
import { readJsonBody } from "@/app/api/_shared/request-body";
import { apiOk } from "@/app/api/_shared/responses";
import { handleRouteError } from "@/app/api/_shared/route-errors";
import { requireTrustedOrigin } from "@/app/api/_shared/request-origin";

export async function POST(request: Request) {
  try {
    await requireTrustedOrigin(request);
    const currentUser = await getCurrentUser(request);

    const body = await readJsonBody(request);
    const input = parseInput(completeOnboardingSchema, body);

    const result = await onboardingService.complete(currentUser.id, input);

    return apiOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
