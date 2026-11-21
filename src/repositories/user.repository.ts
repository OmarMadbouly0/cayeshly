import type { Prisma } from "@/generated/prisma/client";

export const userRepository = {
  async lockById(tx: Prisma.TransactionClient, userId: string) {
    await tx.$queryRaw`
      SELECT "id"
      FROM "user"
      WHERE "id" = ${userId}
      FOR UPDATE
    `;
  },

  async completeOnboarding(
    tx: Prisma.TransactionClient,
    userId: string,
    input: { name: string; pinHash: string },
  ) {
    return tx.user.update({
      where: {
        id: userId,
        onboarded: false,
      },
      data: {
        name: input.name,
        pinHash: input.pinHash,
        onboarded: true,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        onboarded: true,
      },
    });
  },

  async findById(tx: Prisma.TransactionClient, userId: string) {
    return tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        phoneNumberVerified: true,
        onboarded: true,
      },
    });
  },
};
