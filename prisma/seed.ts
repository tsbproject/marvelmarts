import "dotenv/config";
import { PrismaClient, Prisma, ProductStatus, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// --- Seed Categories ---
async function seedCategories() {
  await prisma.category.createMany({
    data: [
      { name: "Shoes", slug: "shoes" },
      { name: "Electronics", slug: "electronics" },
      { name: "Home Appliances", slug: "home-appliances" },
      { name: "Fashion", slug: "fashion" },
    ],
    skipDuplicates: true,
  });
}

// --- Seed Products + Images + Variants ---
async function seedProducts() {
  const shoesCategory = await prisma.category.findUnique({ where: { slug: "shoes" } });
  const electronicsCategory = await prisma.category.findUnique({ where: { slug: "electronics" } });
  const homeCategory = await prisma.category.findUnique({ where: { slug: "home-appliances" } });
  const fashionCategory = await prisma.category.findUnique({ where: { slug: "fashion" } });

  await prisma.product.createMany({
    data: [
      {
        title: "Nike Air Max 270",
        slug: "nike-air-max-270",
        description: "Breathable mesh upper with responsive cushioning for all-day comfort.",
        price: new Prisma.Decimal(139.99),
        status: ProductStatus.ACTIVE, //enum reference
        stock: 60,
        categoryId: shoesCategory!.id,
      },
      {
        title: "Apple iPhone 15 Pro",
        slug: "iphone-15-pro",
        description: "Flagship smartphone with A17 chip, ProMotion display, and titanium design.",
        price: new Prisma.Decimal(999.99),
        status: ProductStatus.ACTIVE,
        stock: 25,
        categoryId: electronicsCategory!.id,
      },
      {
        title: "Dyson V12 Detect Vacuum",
        slug: "dyson-v12-detect",
        description: "Cordless vacuum with laser dust detection and powerful suction.",
        price: new Prisma.Decimal(599.99),
        status: ProductStatus.ACTIVE,
        stock: 20,
        categoryId: homeCategory!.id,
      },
      {
        title: "Levi’s 501 Original Jeans",
        slug: "levis-501-jeans",
        description: "Classic straight-leg denim with timeless style and durable cotton fabric.",
        price: new Prisma.Decimal(89.99),
        status: ProductStatus.ACTIVE,
        stock: 80,
        categoryId: fashionCategory!.id,
      },
    ],
    skipDuplicates: true,
  });

  const allProducts = await prisma.product.findMany();

  for (const product of allProducts) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `https://via.placeholder.com/600x400?text=${product.title.replace(/\s+/g, "+")}`,
        alt: `${product.title} image`,
        order: 0, //matches ProductImage type
      },
    });

    // Variants by category
    if (product.categoryId === shoesCategory!.id) {
      await prisma.variant.createMany({
        data: [
          { productId: product.id, name: "Size 9", sku: `${product.slug}-sz9`, price: product.price.toString(), stock: 10 },
          { productId: product.id, name: "Size 10", sku: `${product.slug}-sz10`, price: product.price.toString(), stock: 15 },
        ],
      });
    } else if (product.categoryId === electronicsCategory!.id) {
      await prisma.variant.createMany({
        data: [
          { productId: product.id, name: "128GB", sku: `${product.slug}-128gb`, price: product.price.toString(), stock: 10 },
          { productId: product.id, name: "256GB", sku: `${product.slug}-256gb`, price: (product.price.add(new Prisma.Decimal(100))).toString(), stock: 8 },
        ],
      });
    } else if (product.categoryId === fashionCategory!.id) {
      await prisma.variant.createMany({
        data: [
          { productId: product.id, name: "Blue", sku: `${product.slug}-blue`, price: product.price.toString(), stock: 20 },
          { productId: product.id, name: "Black", sku: `${product.slug}-black`, price: product.price.toString(), stock: 30 },
        ],
      });
    }
  }
}

// --- Seed Reviews ---
async function seedReviews() {
  const allProducts = await prisma.product.findMany();
  const sampleUsers = await prisma.user.findMany({
    where: { role: UserRole.CUSTOMER }, //enum reference
    take: 5,
  });

  const reviewTemplates = [
    { rating: 5, title: "Exceeded expectations", body: "Fantastic quality and worth every naira." },
    { rating: 4, title: "Very good purchase", body: "Happy with this item, minor improvements possible." },
    { rating: 3, title: "Average experience", body: "Works fine, but expected more." },
    { rating: 5, title: "Highly recommended", body: "Would definitely buy again, great value." },
    { rating: 2, title: "Not satisfied", body: "Didn’t meet expectations, delivery was fine though." },
  ];

  for (const product of allProducts) {
    for (const user of sampleUsers) {
      const randomReview = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: randomReview.rating,
          title: randomReview.title,
          body: `${randomReview.body} (for ${product.title})`,
        },
      });
    }
  }
}

// --- Main Seeder ---
async function main() {
  await seedCategories();
  await seedProducts();
  await seedReviews();
  console.log("Seeded categories, products, images, variants, and reviews successfully");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
