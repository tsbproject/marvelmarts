// import { PrismaClient } from "@prisma/client";
// import { PrismaNeon } from "@prisma/adapter-neon";

// const adapter = new PrismaNeon({
//   connectionString: process.env.DATABASE_URL!,
// });

// declare global {
//   // prevent multiple instances during hot reload in dev
//   var prisma: PrismaClient | undefined;
// }

// export const prisma: PrismaClient =
//   global.prisma ??
//   new PrismaClient({
//     adapter,
//     log: ["query", "error", "warn"],
//   });

// if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// export default prisma;


import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

