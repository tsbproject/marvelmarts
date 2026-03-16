import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, role: true }
    });

    for (const user of users) {
      if (user.role) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roles: [user.role] }
        });
      }
    }

    return new Response("Migration complete! Updated " + users.length + " users", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Migration failed: " + error.message, { status: 500 });
  }
}