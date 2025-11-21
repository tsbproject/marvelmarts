// import { PrismaClient } from '@prisma/client';
// import { PrismaNeon } from '@prisma/adapter-neon';
// import { Pool } from '@neondatabase/serverless';

// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL must be set');
// }

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// const adapter = new PrismaNeon(pool);

// declare global {
//   var prisma: PrismaClient | undefined;
// }

// export const prisma =
//   globalThis.prisma ?? new PrismaClient({ adapter });

// if (process.env.NODE_ENV !== 'production') {
//   globalThis.prisma = prisma;
// }


// app/_lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

// Create a Neon pool for serverless environments
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

