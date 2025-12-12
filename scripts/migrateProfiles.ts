import "dotenv/config";
import { prisma } from '@/app/lib/prisma'; // your Prisma client
import { UserRole } from '@prisma/client'; // import enums from @prisma/client// <-- correct relative path
import ws from "ws";
(globalThis as any).WebSocket = ws;

// const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration of user profiles...');

  // Fetch all users
  const users = await prisma.user.findMany();

  for (const user of users) {
    // ----------------------
    // AdminProfile
    // ----------------------
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      const adminExists = await prisma.adminProfile.findUnique({
        where: { userId: user.id },
      });
      if (!adminExists) {
        await prisma.adminProfile.create({
          data: {
            userId: user.id,
            permissions: {},
            notes: '',
          },
        });
        console.log(`Created AdminProfile for user ${user.id}`);
      }
    }

    // ----------------------
    // VendorProfile
    // ----------------------
    if (user.role === UserRole.VENDOR) {
      const vendorExists = await prisma.vendorProfile.findUnique({
        where: { userId: user.id },
      });
      if (!vendorExists) {
        await prisma.vendorProfile.create({
          data: {
            userId: user.id,
            firstName: '',
            lastName: '',
            storeName: '',
            storePhone: '',
            storeAddress: '',
            country: '',
            state: '',
            isVerified: false,
          },
        });
        console.log(`Created VendorProfile for user ${user.id}`);
      }
    }

    // ----------------------
    // CustomerProfile
    // ----------------------
    if (user.role === UserRole.CUSTOMER) {
      const customerExists = await prisma.customerProfile.findUnique({
        where: { userId: user.id },
      });
      if (!customerExists) {
        await prisma.customerProfile.create({
          data: {
            userId: user.id,
            phone: '',
            address: '',
          },
        });
        console.log(`Created CustomerProfile for user ${user.id}`);
      }
    }
  }

  console.log('Migration finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
