import z from "zod";
import { requiredAmount } from "@/shared/validation/field";
export const walletAmountSchema = z.object({
  amount: requiredAmount("Amount", 100, 100000),
});

export type WalletAmountInput = z.infer<typeof walletAmountSchema>;
