import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });

// Prevent multiple instances in dev
declare global {
  var prisma: PrismaClient | undefined;
}

if (!global.prisma) {
  global.prisma = prisma;
}

export default global.prisma;