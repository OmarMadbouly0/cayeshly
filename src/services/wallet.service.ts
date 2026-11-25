import { walletRepository } from "@/repositories/wallet.repository";
import { NotFoundError } from "@/shared/errors/application-error";
import { pageResult } from "@/shared/pagination";
import type { PaginationInput } from "@/shared/validation/pagination.schema";
import { WalletDepositInput } from "./wallet.schemas";

export const walletService = {
  async getWalletByUserId(userId: string) {
    const wallet = await walletRepository.getWalletByUserId(userId);
    if (!wallet) {
      throw new NotFoundError(
        "Wallet not found; you may not have completed onboarding.",
      );
    }
    return wallet;
  },
  async getTransactionsByUserId(userId: string, pagination: PaginationInput) {
    const wallet = await walletService.getWalletByUserId(userId);
    const { items, total } = await walletRepository.getTransactionsByWalletId(
      wallet.id,
      pagination,
    );

    return pageResult(items, total, pagination.page, pagination.pageSize);
  },

  async walletDeposit(userId: string, input: WalletDepositInput) {
    const wallet = await walletService.getWalletByUserId(userId);

    const transaction = await walletRepository.depositRequest(
      wallet.id,
      input.amount,
    );

    return transaction;
  },
};
