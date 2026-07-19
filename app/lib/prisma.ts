//NEON DATABASE


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


//PRISMA DATABASE

// import { PrismaClient } from '@prisma/client'

// import { PrismaPg } from '@prisma/adapter-pg'
// import { Pool } from 'pg'

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL!,
// })

// const adapter = new PrismaPg(pool)

// const globalForPrisma = globalThis as unknown as {
//   prisma?: PrismaClient
// }

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     adapter,
//     log: ['query', 'error', 'warn'],
//   })

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma
// }

// export default prisma











export async function getSiteSettings() {
  return prisma.siteSettings.findFirst() ?? {
 
  accentNavy: '#002B5B',
  brandPrimary:' #F7931E',
  brandGhost: '#1f2937',
  neutralWhite : '#d1d5db',
  neutralLight: '#f3f4f6',
  neutralDark: '#1f2937',
  brandOrangeLight: '#FFE8CC', 
  neutralGray : '#4B4B4B'      
 
  
 
   
  };
}
