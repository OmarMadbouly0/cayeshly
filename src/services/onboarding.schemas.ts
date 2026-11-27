import { z } from "zod";
import { requiredString, transactionPin } from "@/shared/validation/field";

export const completeOnboardingSchema = z
  .object({
    name: requiredString("Name", 50, 2),
    pin: transactionPin("Transaction PIN"),
  })
  .strict();

export type CompleteOnboardingInput = z.output<typeof completeOnboardingSchema>;
