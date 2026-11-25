import z from "zod";
import { requiredAmount } from "@/shared/validation/field";
export const walletDepositSchema = z.object({
  amount: requiredAmount("Amount", 100, 100000),
});

export type WalletDepositInput = z.infer<typeof walletDepositSchema>;
