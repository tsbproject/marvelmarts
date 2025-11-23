import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from 'pg'; // You can also import the Pool from 'pg' if needed for other purposes

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

// Create a pg Pool if you are still using it for other purposes (optional)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Adjust based on your database's needs
  },
});

// Check if PrismaNeon expects a connection string instead of Pool
const adapter = new PrismaNeon(process.env.DATABASE_URL); // Pass connection string directly

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
