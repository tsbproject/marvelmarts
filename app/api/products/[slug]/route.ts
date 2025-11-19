// app/api/products/[slug]/page.tsx

// app/api/products/[slug]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';

interface Params {
  slug: string;
}

// GET /api/products/[slug] → fetch single product by slug
export async function GET(req: Request, { params }: { params: Params }) {
  const { slug } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true } },
        images: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error('GET /api/products/[slug] error', err);
    return NextResponse.json(
      { message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}




