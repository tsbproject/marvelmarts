// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    
    if (categories.length === 0) {
      return NextResponse.json({ message: 'No categories found' }, { status: 404 });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
