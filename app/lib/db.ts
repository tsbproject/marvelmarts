import { PrismaClient } from "@prisma/client";

// Initialize PrismaClient without the `adapter` configuration
export const prisma = new PrismaClient();

// Example usage:
export async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}
