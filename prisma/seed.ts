// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
   await seedUsersAndCarts();
 
  // Seed categories
  const shoesCategory = await prisma.category.upsert({
    where: { slug: 'shoes' },
    update: {},
    create: {
      name: 'Shoes',
      slug: 'shoes',
    },
    
    
  });

  // Seed products
  const products = await prisma.product.createMany({
    data: [
      {
        title: 'Nike Air Max',
        slug: 'nike-air-max',
        description: 'Comfortable and stylish running shoes.',
        price: 129.99,
        status: 'active',
        stock: 50,
        categoryId: shoesCategory.id,
      },
      {
        title: 'Adidas Ultraboost',
        slug: 'adidas-ultraboost',
        description: 'High-performance sneakers with responsive cushioning.',
        price: 149.99,
        status: 'active',
        stock: 30,
        categoryId: shoesCategory.id,
      },
      {
        title: 'Puma RS-X',
        slug: 'puma-rs-x',
        description: 'Retro-inspired design with modern comfort.',
        price: 109.99,
        status: 'active',
        stock: 40,
        categoryId: shoesCategory.id,
      },
    ],
  });

  // Fetch products to link images and variants
  const allProducts = await prisma.product.findMany();

  for (const product of allProducts) {
    // Seed images
    await prisma.productImage.createMany({
      data: [
        {
          productId: product.id,
          url: `https://via.placeholder.com/600x400?text=${product.title.replace(/\s+/g, '+')}`,
          alt: `${product.title} image`,
        },
      ],
    });

    // Seed variants
    await prisma.variant.createMany({
      data: [
        {
          productId: product.id,
          name: 'Size 9',
          sku: `${product.slug}-sz9`,
          price: product.price,
          stock: 10,
        },
        {
          productId: product.id,
          name: 'Size 10',
          sku: `${product.slug}-sz10`,
          price: product.price,
          stock: 15,
        },
      ],
    });
  }
}

main()
  .then(() => {
    console.log('✅ Seeded products, categories, images, and variants successfully');
  })
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
  })
  .finally(() => {
    prisma.$disconnect();
  });


  import bcrypt from 'bcrypt';

async function seedUsersAndCarts() {
  const passwordHash = await bcrypt.hash('admin1234', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@marvelmedia.ng' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@marvelmedia.ng',
      passwordHash,
      role: 'admin',
    },
  });

  await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
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