"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg"); // use PrismaPg for local seeding
const bcrypt_1 = __importDefault(require("bcrypt"));
// ✅ Use PrismaPg adapter for local seeding
const adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new client_1.PrismaClient({ adapter });
async function seedUsersAndCarts() {
    const passwordHash = await bcrypt_1.default.hash("admin1234", 10);
    const user = await prisma.user.upsert({
        where: { email: "admin@marvelmedia.ng" },
        update: {},
        create: {
            name: "Admin User",
            email: "admin@marvelmedia.ng",
            passwordHash,
            role: "admin",
        },
    });
    await prisma.cart.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
    });
    const products = await prisma.product.findMany();
    for (const product of products) {
        await prisma.review.create({
            data: {
                productId: product.id,
                userId: user.id,
                rating: 5,
                title: `Love the ${product.title}`,
                body: `This ${product.title} exceeded my expectations. Highly recommended!`,
            },
        });
    }
}
async function main() {
    // --- Seed Users ----
    await seedUsersAndCarts();
    // --- Seed Categories ----
    const shoesCategory = await prisma.category.upsert({
        where: { slug: "shoes" },
        update: {},
        create: {
            name: "Shoes",
            slug: "shoes",
        },
    });
    // --- Seed Products ----
    await prisma.product.createMany({
        data: [
            {
                title: "Nike Air Max",
                slug: "nike-air-max",
                description: "Comfortable and stylish running shoes.",
                price: new client_1.Prisma.Decimal(129.99), // ✅ wrap in Decimal
                status: "active",
                stock: 50,
                categoryId: shoesCategory.id,
            },
            {
                title: "Adidas Ultraboost",
                slug: "adidas-ultraboost",
                description: "High-performance sneakers with responsive cushioning.",
                price: new client_1.Prisma.Decimal(149.99),
                status: "active",
                stock: 30,
                categoryId: shoesCategory.id,
            },
            {
                title: "Puma RS-X",
                slug: "puma-rs-x",
                description: "Retro-inspired design with modern comfort.",
                price: new client_1.Prisma.Decimal(109.99),
                status: "active",
                stock: 40,
                categoryId: shoesCategory.id,
            },
        ],
    });
    // --- Attach images + variants ---
    const allProducts = await prisma.product.findMany();
    for (const product of allProducts) {
        await prisma.productImage.createMany({
            data: [
                {
                    productId: product.id,
                    url: `https://via.placeholder.com/600x400?text=${product.title.replace(/\s+/g, "+")}`,
                    alt: `${product.title} image`,
                },
            ],
        });
        await prisma.variant.createMany({
            data: [
                {
                    productId: product.id,
                    name: "Size 9",
                    sku: `${product.slug}-sz9`,
                    price: product.price.toString(), // ✅ convert Decimal to string/number
                    stock: 10,
                },
                {
                    productId: product.id,
                    name: "Size 10",
                    sku: `${product.slug}-sz10`,
                    price: product.price.toString(),
                    stock: 15,
                },
            ],
        });
    }
    console.log("✅ Seeded products, categories, images, variants, users, carts and reviews successfully");
}
main()
    .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
