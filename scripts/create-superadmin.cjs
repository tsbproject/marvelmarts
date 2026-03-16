// scripts/create-superadmin.js

// Force-load .env.local FIRST
require('dotenv').config({ path: '.env.local' });

console.log('Env loaded? DATABASE_URL:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL missing');
  process.exit(1);
}

const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = "superadmin@marvelmarts.com";
  const password = "Password123"; // CHANGE THIS NOW

  try {
    console.log("Creating/Updating SUPER_ADMIN...");

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, roles: true },
    });

    if (existing) {
      console.log(`SUPER_ADMIN already exists: ${email}`);
      console.log("Current role:", existing.role);
      console.log("Current roles:", existing.roles);

      await prisma.user.update({
        where: { email },
        data: {
          role: UserRole.SUPER_ADMIN,
          roles: [UserRole.SUPER_ADMIN],
        },
      });

      console.log("→ Roles updated to SUPER_ADMIN");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: "Super Admin",
        IsVerified: true,
        role: UserRole.SUPER_ADMIN,
        roles: [UserRole.SUPER_ADMIN],
        adminProfile: { create: {} },
      },
    });

    console.log(`✅ SUPER_ADMIN created: ${email}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();