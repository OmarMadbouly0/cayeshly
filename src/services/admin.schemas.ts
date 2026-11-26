import {
  WalletTransactionStatus,
  WalletTransactionType,
} from "@/generated/prisma/enums";
import { paginationQuerySchema } from "@/shared/validation/pagination.schema";
import { z } from "zod";

export const transactionListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(WalletTransactionStatus).optional(),
  type: z.enum(WalletTransactionType).optional(),
});
export type TransactionListInput = z.infer<typeof transactionListQuerySchema>;

export const reviewTransactionSchema = z.object({
  status: z.enum(WalletTransactionStatus).exclude(["pending"]),
});
export type ReviewTransactionInput = z.infer<typeof reviewTransactionSchema>;
