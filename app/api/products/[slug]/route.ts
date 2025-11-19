import { NextResponse } from 'next/server';
import { getPrisma } from '@/app/_lib/prisma';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    const prisma = await getPrisma();

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: true,
        variants: true,
        reviews: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const safeProduct = {
      ...product,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      variants: product.variants.map(v => ({
        ...v,
        price: Number(v.price),
      })),
    };

    return NextResponse.json(safeProduct);
  } catch (err) {
    console.error('GET /api/products/[slug] error', err);
    return NextResponse.json({ message: 'Failed to fetch product' }, { status: 500 });
  }
}