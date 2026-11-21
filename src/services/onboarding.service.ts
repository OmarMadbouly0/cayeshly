import { hashTransactionPin } from "@/lib/pin";
import { withTransaction } from "@/lib/prisma";
import { userRepository } from "@/repositories/user.repository";
import { walletRepository } from "@/repositories/wallet.repository";
import {
  completeOnboardingSchema,
  type CompleteOnboardingInput,
} from "@/services/onboarding.schemas";
import {
  ConflictError,
  NotFoundError,
} from "@/shared/errors/application-error";
import { parseInput } from "@/shared/validation/parse-input";

export const onboardingService = {
  async complete(userId: string, input: CompleteOnboardingInput) {
    const validatedInput = parseInput(completeOnboardingSchema, input);
    const pinHash = await hashTransactionPin(validatedInput.transactionPin);

    return withTransaction(async (tx) => {
      await userRepository.lockById(tx, userId);
      const currentUser = await userRepository.findById(tx, userId);

      if (!currentUser) {
        throw new NotFoundError("User not found.");
      }

      if (currentUser.onboarded) {
        throw new ConflictError("Onboarding is already complete.");
      }

      const user = await userRepository.completeOnboarding(tx, userId, {
        name: validatedInput.name,
        pinHash,
      });

      const wallet = await walletRepository.create(tx, userId);

      return { user, wallet };
    });
  },
};
