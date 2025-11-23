import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, PoolConfig } from 'pg'; // Import Pool and PoolConfig from pg

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

// Create a pg Pool configuration
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL, // Ensure DATABASE_URL is correct
  ssl: {
    rejectUnauthorized: false, // Adjust based on Neon or your DB's SSL requirements
  },
};

// Initialize the pg Pool with the correct configuration
const pool = new Pool(poolConfig);

// Prisma Neon adapter using the pg Pool
const adapter = new PrismaNeon(pool); // Pass the configured pool instance

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
