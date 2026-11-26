import { adminRepository } from "@/repositories/admin.repository";
import { walletRepository } from "@/repositories/wallet.repository";
import {
  ConflictError,
  NotFoundError,
} from "@/shared/errors/application-error";
import { pageResult } from "@/shared/pagination";
import type {
  ReviewTransactionInput,
  TransactionListInput,
} from "./admin.schemas";
import { withTransaction } from "@/lib/prisma";

export const adminService = {
  async getTransactions(query: TransactionListInput) {
    const { items, total } = await adminRepository.getTransactions(query);
    return pageResult(items, total, query.page, query.pageSize);
  },

  async reviewTransaction(
    transactionId: number,
    adminInput: ReviewTransactionInput,
  ) {
    return withTransaction(async (tx) => {
      await walletRepository.lockTransactionById(tx, transactionId);

      const transaction = await walletRepository.getTransactionById(
        transactionId,
        tx,
      );
      if (!transaction) {
        throw new NotFoundError("Transaction not found");
      }

      // what happened if a race condition occurs and that condition is not there ?
      if (transaction.status !== "pending") {
        throw new ConflictError("Only pending transactions can be reviewed.");
      }

      await walletRepository.lockWalletById(tx, transaction.wallet_id);

      const updatedTransaction = await adminRepository.updateTransactionStatus(
        tx,
        transactionId,
        adminInput.status,
      );
      if (adminInput.status == "completed") {
        if (transaction.type === "deposit") {
          await walletRepository.creditBalance(
            tx,
            transaction.wallet_id,
            transaction.amount,
          );
        }

        if (transaction.type === "withdrawal") {
          await walletRepository.debitBalance(
            tx,
            transaction.wallet_id,
            transaction.amount,
          );
        }
      }

      return updatedTransaction;
    });
  },
};
