// import { PrismaClient } from "@prisma/client";
// import { PrismaNeon } from "@prisma/adapter-neon";

// const adapter = new PrismaNeon({
//   connectionString: process.env.DATABASE_URL!,
// });

// export const prisma = new PrismaClient({ adapter });

// // Prevent multiple instances in dev
// declare global {
//   var prisma: PrismaClient | undefined;
// }

// if (!global.prisma) {
//   global.prisma = prisma;
// }

// export default global.prisma;


import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PoolConfig } from 'pg'; // Import PoolConfig from pg

// Ensure DATABASE_URL is set in the environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

// Create a PoolConfig using the DATABASE_URL
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL, // Pass the DATABASE_URL directly
  ssl: {
    rejectUnauthorized: false, // Adjust this based on your DB provider's SSL requirements (e.g., for Neon)
  },
};

// Use PoolConfig directly; no need to create a pg Pool instance
const adapter = new PrismaNeon(poolConfig); // Pass the PoolConfig (or connection string) instead of the Pool instance

// Extend globalThis to store Prisma singleton in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with adapter and optional logging
export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

// Prevent multiple instances in development (Next.js hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Optional: helper function for safe error handling
export function handlePrismaError(err: unknown) {
  if (err instanceof Error) return err.message;
  return 'Unknown Prisma error';
}
