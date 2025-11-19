import { NextResponse } from 'next/server';
import { getPrisma } from '@/app/_lib/prisma';

export async function GET() {
  try {
    const prisma = await getPrisma();

    const categories = await prisma.category.findMany({
      include: {
        children: true, // ✅ include subcategories if you want
        products: {
          include: {
            images: true,
            variants: true,
          },
        },
      },
      orderBy: { name: 'asc' }, // optional sorting
    });

    // ✅ Better: return empty array instead of 404
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}