import "dotenv/config";
import { prisma } from "../app/lib/prisma";
import bcrypt from "bcrypt";
import ws from "ws";

// Provide WebSocket implementation for Neon
(global as any).WebSocket = ws;

async function main() {
  console.log("🚀 Creating Super Admin...");

  const email = "superadmin@marvelmarts.com";
  const password = "SuperAdmin123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log("❌ Super admin already exists.");
    return;
  }

  // Create User with SUPER_ADMIN role
  const newUser = await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN", // UserRole enum will work too if imported
    },
  });

  // Create AdminProfile with full permissions
  await prisma.adminProfile.create({
    data: {
      userId: newUser.id,
      permissions: {
        manageAdmins: true,
        manageVendors: true,
        manageUsers: true,
        manageProducts: true,
        manageCategories: true,
        manageOrders: true,
        manageSettings: true,
      },
      notes: "Initial Super Admin profile",
    },
  });

  console.log("✅ Super Admin Created Successfully:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("User created:", {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });
}

main()
  .catch((err) => console.error("❌ Error creating Super Admin:", err))
  .finally(async () => await prisma.$disconnect());
