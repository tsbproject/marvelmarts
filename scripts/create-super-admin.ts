// scripts/create-super-admin.ts
import "dotenv/config"; // load .env
import ws from "ws";
(globalThis as any).WebSocket = ws; // ✅ patch WebSocket for Neon

import { prisma } from "@/app/lib/prisma"; // ✅ use relative path
import bcrypt from "bcrypt";

async function main() {
  console.log("🚀 Creating Super Admin...");

  const email = "superadmin@marvelmarts.com";
  const password = "SuperAdmin123!";
  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log("❌ Super admin already exists.");
    return;
  }

  const admin = await prisma.admin.create({
    data: {
      name: "Super Admin",
      email,
      password: hashed,
      role: "SUPER_ADMIN",
      permissions: {
        manageAdmins: true,
        manageVendors: true,
        manageProducts: true,
        manageCategories: true,
        manageOrders: true,
        manageSettings: true,
      },
    },
  });

  console.log("✅ Super Admin Created Successfully:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("Admin created:", admin);
}

main()
  .catch((err) => {
    console.error("❌ Error creating Super Admin:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });