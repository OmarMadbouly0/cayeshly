import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { pageArgs } from "@/shared/pagination";
import type { PaginationInput } from "@/shared/validation/pagination.schema";

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
  async getWalletByUserId(userId: string) {
    return prisma.wallet.findUnique({
      where: { userId },
      select: {
        id: true,
        balance: true,
      },
    });
  },
  async getTransactionsByWalletId(
    walletId: string,
    { page, pageSize }: PaginationInput,
  ) {
    const where = { wallet_id: walletId };
    const { skip, take } = pageArgs(page, pageSize);

    const [items, total] = await prisma.$transaction([
      prisma.walletTransaction.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          amount: true,
          type: true,
          created_at: true,
        },
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return { items, total };
  },
};
