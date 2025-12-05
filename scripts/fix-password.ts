import "dotenv/config";
import ws from "ws";
(globalThis as any).WebSocket = ws;

import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

async function fixModel(model: any, label: string) {
  console.log(`\n🔍 Fixing ${label} passwords...`);

  const records = await model.findMany();

  for (const user of records) {
    if (user.passwordHash && user.passwordHash.startsWith("$2b$")) {
      console.log(`➡️  ${label.toLowerCase()} ${user.email} already fixed.`);
      continue;
    }

    if (!user.passwordHash) {
      console.log(`⚠️  ${label.toLowerCase()} ${user.email} has NO passwordHash. Skipping.`);
      continue;
    }

    const hashed = await bcrypt.hash(user.passwordHash, 12);

    await model.update({
      where: { id: user.id },
      data: { passwordHash: hashed },
    });

    console.log(`✅ Fixed password for ${label.toLowerCase()} ${user.email}`);
  }
}

async function main() {
  await fixModel(prisma.admin, "ADMIN");
  await fixModel(prisma.vendorProfile, "VENDOR");     // <-- FIXED
  await fixModel(prisma.user, "CUSTOMER"); // <-- FIXED
}

main()
  .catch((e) => console.error("❌ Error:", e))
  .finally(async () => await prisma.$disconnect());
