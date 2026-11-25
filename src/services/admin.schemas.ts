import { WalletTransactionStatus } from "@/generated/prisma/enums";
import { z } from "zod";

export const reviewTransactionSchema = z.object({
  status: z.enum(WalletTransactionStatus).exclude(["pending"]),
});
export type ReviewTransactionInput = z.infer<typeof reviewTransactionSchema>;
