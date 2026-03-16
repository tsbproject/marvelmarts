// scripts/promote-admin.ts

// 1. Load .env.local explicitly (dotenv must be installed)
import { config } from "dotenv";
config({ path: ".env.local" });

// 2. Import PrismaClient
import { PrismaClient } from "@prisma/client";

// 3. Initialize Prisma (must happen AFTER dotenv load)
const prisma = new PrismaClient();

async function promoteToSuperAdmin() {
  try {
    // Replace with your real SUPER_ADMIN email
    const email = "your-super-admin-email@example.com";

    // Optional: Check current roles first
    const currentUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, roles: true },
    });

    if (!currentUser) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    console.log("Current state:", currentUser);

    // Promote
    const updated = await prisma.user.update({
      where: { email },
      data: {
        roles: ["SUPER_ADMIN"],
      },
      select: { id: true, email: true, roles: true },
    });

    console.log("Success! Updated user:");
    console.log(updated);
  } catch (error) {
    console.error("Error promoting admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToSuperAdmin();