// lib/db.ts
import { PrismaClient } from "@prisma/client";

// Corrected provider value: Use "postgres" instead of "postgresql"
export const prisma = new PrismaClient({
  adapter: {
    provider: "postgres", // Corrected to "postgres"
    url: process.env.DATABASE_URL!,
  },
});

// Example usage:
export async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}
