import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

// Ensure DATABASE_URL is set in the environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

// Prisma Neon adapter using the DATABASE_URL string directly
const adapter = new PrismaNeon(process.env.DATABASE_URL); // Pass the connection string directly

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
