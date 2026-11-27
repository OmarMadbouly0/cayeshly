import { userRepository } from "@/repositories/user.repository";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import {
  ForbiddenError,
  NotFoundError,
} from "@/shared/errors/application-error";
import { Prisma } from "@/generated/prisma/browser";

export async function hashTransactionPin(pin: string): Promise<string> {
  return hashPassword(pin);
}

export async function verifyTransactionPin(
  pin: string,
  storedHash: string,
): Promise<boolean> {
  return verifyPassword({
    password: pin,
    hash: storedHash,
  });
}

export async function requireTransactionPin(
  userId: string,
  pin: string,
  tx: Prisma.TransactionClient,
) {
  const user = await userRepository.findByIdWithPinHash(tx, userId);
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  const isPinValid = await verifyTransactionPin(pin, user.pinHash!);
  if (!isPinValid) {
    throw new ForbiddenError("Invalid transaction pin.");
  }
}
