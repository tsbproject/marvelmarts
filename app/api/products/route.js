import { NextResponse } from 'next/server';

export async function GET() {
  const products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 89.99,
      category: 'Electronics',
      image: '/images/products/headphones.jpg',
      tag: 'Featured',
    },
    // ...
  ];
  return NextResponse.json(products);
}
