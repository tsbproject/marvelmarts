import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import type { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: { slug: string } } // correct App Router type
) {
  const { slug } = context.params;

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            images: true,
            variants: true,
          },
        },
        children: true, // optional: get subcategories
      },
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (err) {
    console.error('GET /api/categories/[slug] error', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
