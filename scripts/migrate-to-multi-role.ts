import { prisma } from "@/app/lib/prisma";

async function fixRoles() {
  try {
    // Find users who have empty or missing roles array
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { roles: { isEmpty: true } },
          { roles: null },
        ],
      },
      select: { id: true, email: true },
    });

    console.log(`Found ${users.length} users with empty/missing roles`);

    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roles: ["CUSTOMER"],  // safe default for old users
        },
      });
      console.log(`Updated ${user.email} → roles: ["CUSTOMER"]`);
    }

    console.log("Role migration complete - all users now have roles array");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRoles();