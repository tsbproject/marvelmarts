import "dotenv/config";
import ws from "ws";
(globalThis as any).WebSocket = ws;

import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🚀 Backfilling users...");

  const users = await prisma.user.findMany();

  for (const user of users) {
    let updatedData: any = {};

    // Ensure email exists
    if (!user.email) {
      updatedData.email = `user-${user.id}@example.com`; // temporary unique email
    }

    // Ensure passwordHash exists
    if (!user.passwordHash) {
      const tempPassword = "ChangeMe123!";
      const hash = await bcrypt.hash(tempPassword, 12);
      updatedData.passwordHash = hash;
      console.log(`Assigned temp password for user ${user.id}: ${tempPassword}`);
    }

    if (Object.keys(updatedData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updatedData,
      });
      console.log(`✅ Updated user ${user.id}`);
    }
  }
}

main()
  .catch((e) => console.error("❌ Error backfilling users:", e))
  .finally(async () => await prisma.$disconnect());
