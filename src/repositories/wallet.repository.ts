import type { Prisma } from "@/generated/prisma/client";

export const walletRepository = {
  async create(tx: Prisma.TransactionClient, userId: string) {
    return tx.wallet.create({
      data: { userId },
      select: {
        id: true,
        balance: true,
      },
    });
  },
};
