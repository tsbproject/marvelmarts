import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, PoolConfig } from 'pg'; // Import Pool and PoolConfig from pg

// Ensure DATABASE_URL is set in the environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

// Create a PoolConfig using the DATABASE_URL string
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL, // Pass the DATABASE_URL from .env
  ssl: {
    rejectUnauthorized: false, // Adjust this based on your DB's SSL requirements (e.g., for Neon)
  },
};

// Create a pg Pool instance using the poolConfig
const pool = new Pool(poolConfig);

// Prisma Neon adapter using the pg Pool
const adapter = new PrismaNeon(pool); // Pass the Pool instance

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
