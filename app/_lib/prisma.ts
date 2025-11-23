import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from 'pg'; // Use `pg`'s Pool instead of @neondatabase/serverless

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

// Create a pg Pool for the Neon serverless environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this is correct
  ssl: {
    rejectUnauthorized: false, // Or customize this based on your Neon configuration
  },
});

// Prisma Neon adapter
const adapter = new PrismaNeon(pool);

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
