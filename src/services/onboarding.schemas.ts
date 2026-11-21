import { z } from "zod";
import { requiredString } from "@/shared/validation/field";

export const completeOnboardingSchema = z
  .object({
    name: requiredString("Name", 50, 2),
    transactionPin: z
      .string()
      .regex(/^[0-9]{6}$/, "Transaction PIN must contain exactly 6 digits."),
  })
  .strict();

export type CompleteOnboardingInput = z.output<typeof completeOnboardingSchema>;
