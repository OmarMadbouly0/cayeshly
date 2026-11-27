import type { Prisma } from "@/generated/prisma/client";
import prisma, { withTransaction } from "@/lib/prisma";
import { walletRepository } from "@/repositories/wallet.repository";
import {
  ConflictError,
  NotFoundError,
  PaymentRequiredError,
} from "@/shared/errors/application-error";
import { pageResult } from "@/shared/pagination";
import type { PaginationInput } from "@/shared/validation/pagination.schema";
import type { WalletTransactionInput } from "@/services/wallet.schemas";
import { requireTransactionPin } from "@/lib/pin";

export const walletService = {
  async getWalletByUserId(
    userId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    const wallet = await walletRepository.getWalletByUserId(userId, tx);
    if (!wallet) {
      throw new NotFoundError(
        "Wallet not found; you may not have completed onboarding.",
      );
    }
    return wallet;
  },
  async getWalletSummary(userId: string) {
    return prisma.$transaction(async (tx) => {
      const wallet = await walletService.getWalletByUserId(userId, tx);
      const frozenBalance = await walletRepository.getFrozenBalance(
        tx,
        wallet.id,
      );
      return {
        wallet: wallet.id,
        frozenBalance,
        availableBalance: wallet.balance.sub(frozenBalance),
      };
    });
  },
  async getTransactionsByUserId(userId: string, pagination: PaginationInput) {
    const wallet = await walletService.getWalletByUserId(userId);
    const { items, total } = await walletRepository.getTransactionsByWalletId(
      wallet.id,
      pagination,
    );

    return pageResult(items, total, pagination.page, pagination.pageSize);
  },

  async walletDeposit(userId: string, input: WalletTransactionInput) {
    return withTransaction(async (tx) => {
      const wallet = await walletService.getWalletByUserId(userId, tx);
      if (!wallet) {
        throw new NotFoundError("Wallet not found.");
      }
      await requireTransactionPin(userId, input.pin, tx);

      const transaction = await walletRepository.createTransactionRequest(
        wallet.id,
        input.amount,
        "deposit",
        tx,
      );

      return transaction;
    });
  },

  async requestWithdrawal(userId: string, input: WalletTransactionInput) {
    const { id } = await walletService.getWalletByUserId(userId, prisma);
    return withTransaction(async (tx) => {
      await requireTransactionPin(userId, input.pin, tx);
      await walletRepository.lockWalletById(tx, id);
      const wallet = await walletService.getWalletByUserId(userId, tx);
      const frozenBalance = await walletRepository.getFrozenBalance(
        tx,
        wallet.id,
      );
      if (wallet.balance.sub(frozenBalance).lt(input.amount)) {
        throw new PaymentRequiredError("Insufficient available balance.");
      }

      return walletRepository.createTransactionRequest(
        wallet.id,
        input.amount,
        "withdrawal",
        tx,
      );
    });
  },
  async cancelTransaction(userId: string, transactionId: number) {
    return withTransaction(async (tx) => {
      await walletRepository.lockTransactionById(tx, transactionId);
      const transaction = await walletRepository.getTransactionById(
        transactionId,
        tx,
      );
      if (!transaction) {
        throw new NotFoundError("Transaction not found.");
      }
      if (transaction.status !== "pending") {
        throw new ConflictError("Only pending transactions can be canceled.");
      }
      await walletRepository.cancelTransaction(tx, userId, transactionId);
    });
  },
};
