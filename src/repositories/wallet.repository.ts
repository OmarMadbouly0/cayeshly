import type { Prisma } from "@/generated/prisma/client";
import { Decimal } from "@/generated/prisma/internal/prismaNamespace";
import prisma from "@/lib/prisma";
import { pageArgs } from "@/shared/pagination";
import type { PaginationInput } from "@/shared/validation/pagination.schema";
import type { WalletTransactionStatus } from "@/generated/prisma/enums";
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
  async lockTransactionById(tx: Prisma.TransactionClient, id: number) {
    await tx.$queryRaw`
    SELECT "id"
    FROM "wallet_transactions"
    WHERE "id" = ${id}
    FOR UPDATE
  `;
  },

  async lockWalletById(tx: Prisma.TransactionClient, id: number) {
    await tx.$queryRaw`
    SELECT "id"
    FROM "wallets"
    WHERE "id" = ${id}
    FOR UPDATE
  `;
  },
  async getWalletByUserId(
    userId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.wallet.findUnique({
      where: { userId },
      select: {
        id: true,
        balance: true,
      },
    });
  },
  async getTransactionsByWalletId(
    walletId: number,
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
          status: true,
          created_at: true,
        },
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return { items, total };
  },
  async createTransactionRequest(
    walletId: number,
    amount: Decimal,
    type: "deposit" | "withdrawal",
    tx: Prisma.TransactionClient,
  ) {
    return tx.walletTransaction.create({
      data: {
        wallet_id: walletId,
        amount,
        type,
      },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        created_at: true,
      },
    });
  },
  async getFrozenBalance(tx: Prisma.TransactionClient, walletId: number) {
    const result = await tx.walletTransaction.aggregate({
      where: { wallet_id: walletId, type: "withdrawal", status: "pending" },
      _sum: { amount: true },
    });
    return result._sum.amount ?? new Decimal(0);
  },
  async getTransactionById(
    transactionId: number,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.walletTransaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        wallet_id: true,
        amount: true,
        type: true,
        status: true,
        created_at: true,
      },
    });
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

  async creditBalance(
    tx: Prisma.TransactionClient,
    walletId: number,
    amount: Decimal,
  ) {
    return tx.wallet.update({
      where: { id: walletId },
      data: { balance: { increment: amount } },
    });
  },

  async debitBalance(
    tx: Prisma.TransactionClient,
    walletId: number,
    amount: Decimal,
  ) {
    return tx.wallet.updateMany({
      where: {
        id: walletId,
        balance: { gte: amount },
      },
      data: { balance: { decrement: amount } },
    });
  },
  async getWalletById(walletId: number, tx: Prisma.TransactionClient = prisma) {
    return tx.wallet.findUnique({
      where: { id: walletId },
      select: {
        id: true,
        balance: true,
      },
    });
  },
};
