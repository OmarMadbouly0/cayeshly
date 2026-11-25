import { walletRepository } from "@/repositories/wallet.repository";
import {
  ConflictError,
  NotFoundError,
} from "@/shared/errors/application-error";
import { ReviewTransactionInput } from "./admin.schemas";
import { withTransaction } from "@/lib/prisma";

export const adminService = {
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

      // if a race condition occurs and that condition is not there ?
      if (transaction.status !== "pending") {
        throw new ConflictError("Only pending transactions can be reviewed.");
      }

      await walletRepository.lockWalletById(tx, transaction.wallet_id);

      const wallet = await walletRepository.getWalletById(
        transaction.wallet_id,
        tx,
      );
      const updatedTransaction = await walletRepository.updateTransactionStatus(
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
          if (wallet!.balance.lt(transaction.amount)) {
            throw new ConflictError("Insufficient wallet balance.");
          }
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
