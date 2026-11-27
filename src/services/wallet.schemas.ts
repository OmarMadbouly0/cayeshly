import z from "zod";
import { requiredAmount, transactionPin } from "@/shared/validation/field";
export const walletTransactionSchema = z.object({
  amount: requiredAmount("Amount", 100, 100000),
  pin: transactionPin("Transaction PIN"),
});

export type WalletTransactionInput = z.infer<typeof walletTransactionSchema>;
