import { NextResponse } from 'next/server';
import { getPrisma } from '@/app/_lib/prisma';

export async function GET() {
  try {
    const prisma = await getPrisma();
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}