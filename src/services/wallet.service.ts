import type { Prisma } from "@/generated/prisma/client";
import prisma, { withTransaction } from "@/lib/prisma";
import { walletRepository } from "@/repositories/wallet.repository";
import {
  NotFoundError,
  PaymentRequiredError,
} from "@/shared/errors/application-error";
import { pageResult } from "@/shared/pagination";
import type { PaginationInput } from "@/shared/validation/pagination.schema";
import type { WalletAmountInput } from "./wallet.schemas";

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

  async walletDeposit(userId: string, input: WalletAmountInput) {
    const wallet = await walletService.getWalletByUserId(userId);
    if (!wallet) {
      throw new NotFoundError("Wallet not found.");
    }
    const transaction = await walletRepository.createTransactionRequest(
      wallet.id,
      input.amount,
      "deposit",
      prisma,
    );

    return transaction;
  },

  async requestWithdrawal(userId: string, input: WalletAmountInput) {
    const { id } = await walletService.getWalletByUserId(userId, prisma);
    return withTransaction(async (tx) => {
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
};
