require("dotenv/config");
const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const categoriesJson = require("./data/categories.json");

const prisma = new PrismaClient();

async function createCategories(categories, parentId = null) {
  for (const cat of categories) {
    const c = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
        parentId,
      },
    });

    if (cat.children?.length) {
      await createCategories(cat.children, c.id);
    }
  }
}

async function seed() {
  const email = "superadmin@marvelmarts.com";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    const passwordHash = await bcrypt.hash("Superoga007$#@", 10);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: "Super Admin",
        isVerified: true,
        roles: { set: [UserRole.SUPER_ADMIN] },
        adminProfile: { create: {} },
      },
    });
  }

  await createCategories(categoriesJson);

  console.log("Seeding finished ✅");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
