import prisma from "@/lib/prisma";

export const healthService = {
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("Database connection error:", error);
      return false;
    }
  },
};
