import "dotenv/config";
import { hashTransactionPin } from "../src/lib/pin";
import prisma from "../src/lib/prisma";

async function seed() {
  if (process.env.NODE_ENV === "production" || !process.env.DATABASE_URL) {
    throw new Error("Set DATABASE_URL to a test database before seeding.");
  }

  const pinHash = await hashTransactionPin("123456");
  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { phoneNumber: "+15550100001" },
      update: {},
      create: {
        id: "postman-user",
        name: "Postman User",
        email: "+15550100001@phone.cayeshly.temp",
        phoneNumber: "+15550100001",
        phoneNumberVerified: true,
      },
    });
    const admin = await tx.user.upsert({
      where: {
        phoneNumber: "+15550100002",
        email: "+15550100002@phone.cayeshly.temp",
      },
      update: { role: "admin", onboarded: true },
      create: {
        id: "postman-admin",
        name: "Postman Admin",
        email: "+15550100002@phone.cayeshly.temp",
        phoneNumber: "+15550100002",
        phoneNumberVerified: true,
        onboarded: true,
        role: "admin",
        pinHash,
      },
      select: { id: true, pinHash: true },
    });
    if (!admin.pinHash) {
      await tx.user.update({ where: { id: admin.id }, data: { pinHash } });
    }
    await tx.wallet.upsert({
      where: { userId: admin.id },
      update: {},
      create: { userId: admin.id },
    });
  });
  console.log("Postman fixtures ready. Sign in using the user and admin OTP requests.");
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
