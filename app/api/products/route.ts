import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPrisma } from '@/app/_lib/prisma';

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();

  try {
    const body = await req.json();

    const {
      title,
      slug,
      description,
      price,
      categoryId,
      brand,
      stock,
      status,
      images,
    } = body;

    if (!title || !slug || !description || typeof price !== 'number') {
      return NextResponse.json(
        { message: 'title, slug, description and price are required' },
        { status: 400 }
      );
    }

    // Step 1: Create product
    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        price,
        brand,
        stock: stock ?? 0,
        status: status ?? 'active',
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
    });

    // Step 2: Create images if provided
    if (images && Array.isArray(images)) {
      await prisma.image.createMany({
        data: images.map((img: { url: string; alt?: string; position?: number }) => ({
          url: img.url,
          alt: img.alt ?? '',
          position: img.position ?? 0,
          productId: product.id,
        })),
      });
    }

    // Step 3: Fetch full product with relations
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: { select: { id: true, name: true } },
        images: true,
        variants: true,
      },
    });

    if (!fullProduct) {
      return NextResponse.json(
        { message: 'Product created but failed to fetch full data' },
        { status: 201 }
      );
    }

    return NextResponse.json(fullProduct, { status: 201 });
  } catch (err) {
    console.error('POST /api/products error', err);
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
  }
}