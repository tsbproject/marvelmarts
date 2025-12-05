import "dotenv/config";
import { prisma } from "../app/lib/prisma";
import bcrypt from "bcrypt";
import ws from "ws";

// 👇 Fix: provide WebSocket implementation for Neon
(global as any).WebSocket = ws;

async function main() {
  console.log("🚀 Creating Super Admin...");

  const email = "superadmin@marvelmarts.com";
  const password = "SuperAdmin123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log("❌ Super admin already exists.");
    return;
  }

  const newAdmin = await prisma.admin.create({
    data: {
      name: "Super Admin",
      email,
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN",
      permissions: {
        manageAdmins: true,
        manageVendors: true,
        manageUsers:true,
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
  console.log("Admin created:", {
    id: newAdmin.id,
    email: newAdmin.email,
    role: newAdmin.role,
  });
}

main()
  .catch((err) => console.error("❌ Error creating Super Admin:", err))
  .finally(async () => await prisma.$disconnect());
