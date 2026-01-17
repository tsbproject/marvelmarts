import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Create a Postgres connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Pass adapter into PrismaClient
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ["info", "warn", "error"],
});

async function main() {
  const helpArticles = [
    {
      title: "How to Track My Order",
      slug: "track-order-guide",
      excerpt: "Step-by-step guide to finding your tracking number and following your package.",
      content: "Once your order ships, you will receive an email with a tracking number...",
      keywords: ["track", "shipping", "delivery", "status", "where is my order"],
      category: "Shipping",
    },
    {
      title: "Return & Refund Policy",
      slug: "returns-refunds",
      excerpt: "Learn about our 30-day money-back guarantee and how to start a return.",
      content: "Items must be in original packaging to be eligible for a full refund...",
      keywords: ["refund", "return", "money back", "exchange", "broken"],
      category: "Payments",
    },
    {
      title: "Changing Your Shipping Address",
      slug: "change-address",
      excerpt: "How to update your delivery details before your order is processed.",
      content: "Address changes can only be made within 2 hours of placing an order...",
      keywords: ["address", "change", "shipping", "location", "wrong address"],
      category: "Shipping",
    },
    {
      title: "Payment Methods Accepted",
      slug: "payment-methods",
      excerpt: "A list of all credit cards, wallets, and payment providers we support.",
      content: "We accept Visa, Mastercard, American Express, and PayPal...",
      keywords: ["payment", "credit card", "paypal", "visa", "checkout"],
      category: "Payments",
    },
    {
      title: "Resetting Your Password",
      slug: "reset-password",
      excerpt: "Can't log in? Follow these steps to securely reset your account password.",
      content: "Click on 'Forgot Password' at the login screen to receive a reset link...",
      keywords: ["password", "login", "account", "security", "forgot"],
      category: "Account",
    },
  ];

  console.log("Cleaning up old help articles...");
  await prisma.helpArticle.deleteMany();

  console.log("Seeding help articles...");
  for (const article of helpArticles) {
    await prisma.helpArticle.create({ data: article });
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // close Postgres pool
  });
