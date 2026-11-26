import { Prisma, WalletTransactionStatus } from "@/generated/prisma/browser";
import prisma from "@/lib/prisma";
import type { TransactionListInput } from "@/services/admin.schemas";
import { pageArgs } from "@/shared/pagination";

export const adminRepository = {
  async getTransactions({
    page,
    pageSize,
    status,
    type,
  }: TransactionListInput) {
    const where = { status, type };
    const { skip, take } = pageArgs(page, pageSize);

    const [items, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        skip,
        take,
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        select: {
          id: true,
          wallet_id: true,
          amount: true,
          type: true,
          status: true,
          created_at: true,
        },
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return { items, total };
  },
  async updateTransactionStatus(
    tx: Prisma.TransactionClient,
    transactionId: number,
    status: Exclude<WalletTransactionStatus, "pending">,
  ) {
    return tx.walletTransaction.update({
      where: { id: transactionId, status: "pending" },
      data: { status },
    });
  },
};
