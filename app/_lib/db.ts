// // lib/db.ts
// import { prisma } from "./prisma";

// export async function getProducts() {
//   const products = await prisma.product.findMany({
//     orderBy: { createdAt: "desc" },
//     take: 10,
//   });

//   return products;






// }



// lib/db.ts
import { PrismaClient } from "@prisma/client";

// Prisma 7 requires passing the connection URL explicitly
export const prisma = new PrismaClient({
  adapter: {
    provider: "postgresql",
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
