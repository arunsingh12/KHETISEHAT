import { PrismaClient } from "@/generated/prisma/client";

// Next.js reloads modules on every request in dev, which would otherwise
// spin up a fresh PrismaClient (and a fresh connection pool) per request.
// Cache the instance on `globalThis` so dev keeps a single pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — see .env.example");
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
