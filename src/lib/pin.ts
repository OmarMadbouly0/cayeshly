import { hashPassword, verifyPassword } from "better-auth/crypto";

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
