// import type { PrismaClient } from '@prisma/client';

// declare global {
//   // eslint-disable-next-line no-var
//   var prisma: PrismaClient | undefined;
// }

// export async function getPrisma(): Promise<PrismaClient> {
//   if (globalThis.prisma) return globalThis.prisma;

//   const { PrismaClient } = await import('@prisma/client');
//   const client = new PrismaClient();

//   if (process.env.NODE_ENV !== 'production') {
//     globalThis.prisma = client;
//   }

//   return client;
// }



import type { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export async function getPrisma(): Promise<PrismaClient> {
  if (globalThis.prisma) return globalThis.prisma;

  const { PrismaClient } = await import('@prisma/client');
  const client = new PrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = client;
  }

  return client;
}